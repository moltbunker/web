// E2E encryption for exec terminal sessions using Web Crypto API.
// Key hierarchy: wallet signature → HKDF → master_kek → per-session AES-256-GCM key.
// No external crypto libraries needed — all browser-native.

// Helper to get a plain ArrayBuffer for Web Crypto API.
// TS 5.9 strict mode: Uint8Array.buffer is ArrayBufferLike (may be SharedArrayBuffer),
// but Web Crypto requires ArrayBuffer. Slice always returns a new ArrayBuffer.
function buf(arr: Uint8Array): ArrayBuffer {
  return arr.slice().buffer as ArrayBuffer
}

const HKDF_SALT = new TextEncoder().encode('moltbunker-exec-v1')
const HKDF_INFO_MASTER = new TextEncoder().encode('master-kek')
const HKDF_INFO_SESSION = new TextEncoder().encode('session-key')

/** Derive a master KEK from a wallet signature (deterministic via RFC 6979). */
export async function deriveMasterKEK(signatureHex: string): Promise<CryptoKey> {
  // Import the signature bytes as raw key material for HKDF
  const sigBytes = hexToBytes(signatureHex.replace(/^0x/, ''))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    buf(sigBytes),
    'HKDF',
    false,
    ['deriveKey'],
  )

  // Derive a 256-bit AES key using HKDF-SHA256
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: buf(HKDF_SALT),
      info: buf(HKDF_INFO_MASTER),
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['encrypt', 'decrypt'],
  )
}

/** Derive a per-session key from master KEK + session nonce. */
export async function deriveSessionKey(
  masterKEK: CryptoKey,
  sessionNonce: Uint8Array,
): Promise<CryptoKey> {
  const nonceInfo = new Uint8Array([...HKDF_INFO_SESSION, ...sessionNonce])

  // Encrypt a known plaintext with masterKEK+nonce to derive session key material.
  // Since masterKEK is non-extractable, we use AES-GCM as a KDF-like construction.
  const iv = sessionNonce.slice(0, 12)
  const plaintext = new TextEncoder().encode('session-key-derivation-' + bytesToHex(sessionNonce))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: buf(iv), additionalData: buf(nonceInfo) },
    masterKEK,
    buf(plaintext),
  )

  // Use the ciphertext as key material for the session key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encrypted.slice(0, 32), // Take first 32 bytes
    'HKDF',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: buf(sessionNonce),
      info: buf(HKDF_INFO_SESSION),
    },
    keyMaterial,
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
