// E2E encryption for exec terminal sessions using Web Crypto API.
// Key hierarchy: wallet signature → HKDF → master_kek → exec_key → session_key (AES-256-GCM).
// No external crypto libraries needed — all browser-native.
//
// Constants must match Go side (cmd/cli/commands/exec_crypto.go):
//   Salt:         "moltbunker-exec"
//   Master info:  "master-kek"
//   Exec info:    "exec-key"
//   Session info: "session-key"

// Helper to get a plain ArrayBuffer for Web Crypto API.
// TS 5.9 strict mode: Uint8Array.buffer is ArrayBufferLike (may be SharedArrayBuffer),
// but Web Crypto requires ArrayBuffer. Slice always returns a new ArrayBuffer.
function buf(arr: Uint8Array): ArrayBuffer {
  return arr.slice().buffer as ArrayBuffer
}

const HKDF_SALT = new TextEncoder().encode('moltbunker-exec')
const HKDF_INFO_MASTER = new TextEncoder().encode('master-kek')
const HKDF_INFO_EXEC = new TextEncoder().encode('exec-key')
const HKDF_INFO_SESSION = new TextEncoder().encode('session-key')

/**
 * Derive a master KEK from a wallet signature (deterministic via RFC 6979).
 * Returns an HKDF-capable key (not AES-GCM) so it can be used for chained derivation.
 *
 * Go equivalent: hkdfDerive(sig, "moltbunker-exec", "master-kek", 32)
 */
export async function deriveMasterKEK(signatureHex: string): Promise<CryptoKey> {
  // Import the signature bytes as raw key material for HKDF
  const sigBytes = hexToBytes(signatureHex.replace(/^0x/, ''))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    buf(sigBytes),
    'HKDF',
    false,
    ['deriveBits', 'deriveKey'],
  )

  // Derive 256 bits of key material using HKDF-SHA256
  const masterBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: buf(HKDF_SALT),
      info: buf(HKDF_INFO_MASTER),
    },
    keyMaterial,
    256,
  )

  // Import the derived bits as a new HKDF key for chained derivation
  return crypto.subtle.importKey(
    'raw',
    masterBits,
    'HKDF',
    false,
    ['deriveBits', 'deriveKey'],
  )
}

/**
 * Derive a per-container exec_key from master KEK + deploy nonce.
 *
 * Go equivalent: hkdfDerive(masterKEK, deployNonce, "exec-key", 32)
 */
export async function deriveExecKey(
  masterKEK: CryptoKey,
  deployNonce: Uint8Array,
): Promise<CryptoKey> {
  // Derive 256 bits using HKDF with deploy_nonce as salt
  const execBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: buf(deployNonce),
      info: buf(HKDF_INFO_EXEC),
    },
    masterKEK,
    256,
  )

  // Import as HKDF key for session key derivation
  return crypto.subtle.importKey(
    'raw',
    execBits,
    'HKDF',
    false,
    ['deriveBits', 'deriveKey'],
  )
}

/**
 * Derive a per-session AES-256-GCM key from exec_key + session nonce.
 *
 * Go equivalent: hkdfDerive(execKey, sessionNonce, "session-key", 32)
 */
export async function deriveSessionKey(
  execKey: CryptoKey,
  sessionNonce: Uint8Array,
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: buf(sessionNonce),
      info: buf(HKDF_INFO_SESSION),
    },
    execKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** Encrypt terminal data with AES-256-GCM. Returns iv + ciphertext. */
export async function encryptFrame(
  key: CryptoKey,
  plaintext: Uint8Array,
): Promise<Uint8Array> {
  // Generate random 12-byte IV for each frame
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: buf(iv) },
    key,
    buf(plaintext),
  )

  // Prepend IV to ciphertext: [12 bytes IV][N bytes ciphertext+tag]
  const result = new Uint8Array(12 + ciphertext.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(ciphertext), 12)
  return result
}

/** Decrypt terminal data. Input is iv + ciphertext as produced by encryptFrame. */
export async function decryptFrame(
  key: CryptoKey,
  encrypted: Uint8Array,
): Promise<Uint8Array> {
  if (encrypted.length < 13) {
    throw new Error('encrypted frame too short')
  }
  const iv = encrypted.slice(0, 12)
  const ciphertext = encrypted.slice(12)

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: buf(iv) },
    key,
    buf(ciphertext),
  )
  return new Uint8Array(plaintext)
}

/** Generate a random session nonce (32 bytes). */
export function generateSessionNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32))
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export { hexToBytes, bytesToHex }
