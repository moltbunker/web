# Security & Privacy

MoltBunker is built with security at every layer — transport, identity, containers, payments, and network topology.

## Transport Security

All node-to-node communication uses **TLS 1.3** with mutual authentication.

| Feature | Implementation |
|---------|---------------|
| TLS Version | 1.3 only (no downgrade) |
| Cipher Suites | AES-256-GCM-SHA384, ChaCha20-Poly1305-SHA256, AES-128-GCM-SHA256 |
| Client Auth | Mutual TLS (`RequireAnyClientCert`) |
| NodeID Verification | SHA256(SubjectPublicKeyInfo) verified post-handshake |
| Certificate Pinning | TOFU (Trust On First Use), SPKI fingerprint, 10K capacity |
| Handshake Timeout | 30 seconds |

Certificate pinning uses the SPKI hash (not the full certificate), so cert rotation doesn't break peer trust.

## Identity & Key Management

### Node Identity

- **Algorithm**: Ed25519 for node keys
- **NodeID**: `SHA256(PublicKey)` — 32-byte deterministic identity
- **Storage**: Encrypted with Argon2id KDF (64MB memory, 4 threads) + AES-256-GCM
- **File format**: `[4B magic][16B salt][12B nonce][ciphertext]`
- **Permissions**: 0600 on private key files

### Ethereum Wallet

- **Keystore**: go-ethereum V3 (Scrypt)
- **Directory permissions**: 0700
- **Memory protection**: Private keys zeroed after use via `ClearCachedKey()`

### TLS Certificates

- Auto-generated per node
- Rotation with SPKI continuity (pinning survives renewal)

## Message Security

Every P2P message passes through an **8-step validation pipeline** before processing:

```
1. Rate Limit     → Per-peer, tiered by staking level
2. Ban Check      → Reject banned peers immediately
3. Nonce+Timestamp→ Replay protection (24B nonce, 5min max age, 30s future skew)
4. Protocol Version → Min/max version compatibility
5. Ed25519 Signature → Verify message authenticity
6. Stake Gate     → Privileged messages require verified on-chain stake
7. Handler Dispatch → Route to correct message handler
8. Peer Scoring   → Update behavioral score based on result
```

### Replay Protection

| Parameter | Value |
|-----------|-------|
| Nonce size | 24 bytes (random) |
| Max message age | 5 minutes |
| Max future skew | 30 seconds |
| Nonce window | 10 minutes retention |
| Cleanup interval | 60 seconds |

Duplicate nonces, expired messages, and future-dated messages are all rejected.

### Announce Protocol (Wallet Proof)

After TLS handshake, peers must prove wallet ownership via **EIP-191 personal_sign**:

1. Sign message: `moltbunker-announce:{nodeID}:{wallet}:{timestamp}:{nonce}`
2. Peer verifies signature via `ecrecover`
3. Binds NodeID to wallet address (enables stake verification)
4. **30-second grace period** — announce or get disconnected

### Stake-Gated Messages

| Free (no stake required) | Privileged (stake required) |
|--------------------------|-----------------------------|
| Ping, Pong, FindNode, Nodes, Health, Announce | Deploy, DeployAck, Gossip, ContainerStatus, ReplicaSync, Logs, Stop, Delete, Exec |

Unknown message types default to **require stake** (fail-closed).

## Sybil Resistance

### Subnet Limiter

- **IPv4**: Max 3 peers per /24 subnet
- **IPv6**: Max 3 peers per /48 subnet
- **Exempt**: localhost, private IPs (10/8, 172.16/12, 192.168/16), Tor (.onion)

### Eclipse Prevention

| Threshold | Value |
|-----------|-------|
| Max region share | 50% of peers from one region |
| Max subnet share | 30% of peers from one /16 |
| Min regions | 2 distinct regions |
| Bootstrap bypass | First 4 peers always allowed |

### Tiered Rate Limits

| Staking Tier | Messages/sec | Burst | Auto-ban Duration |
|-------------|-------------|-------|-------------------|
| Unstaked | 10 | 20 | 1 hour |
| Starter | 50 | 100 | 30 minutes |
| Bronze | 100 | 200 | 30 minutes |
| Silver | 200 | 400 | 15 minutes |
| Gold | 500 | 1,000 | 5 minutes |
| Platinum | 1,000 | 2,000 | 5 minutes |

3 rate limit violations within 5 minutes triggers automatic ban.

## Peer Defense

### Behavioral Scoring

Every peer has a score from **0.0** (worst) to **1.0** (best), starting at **0.5**.

| Threshold | Action |
|-----------|--------|
| < 0.1 | Auto-ban |
| < 0.2 | 50% rate limit cut |
| < 0.3 | Increased logging |

Score adjustments:

| Event | Delta |
|-------|-------|
| Valid message | +0.001 |
| Invalid message | -0.05 |
| Failed deploy | -0.10 |
| Gossip spam | -0.03 |
| Rate limit hit | -0.02 |
| Malformed payload | -0.05 |
| Good uptime | +0.01 |

Scores decay toward 0.5 (neutral) at 0.01 per hour.

### Persistent Ban List

- Bans survive daemon restarts (atomic save to disk)
- Duration: timed or permanent
- Auto-cleanup of expired bans

## Container Security

### Seccomp Profiles

**55 dangerous syscalls blocked**, including:

- **Kernel modules**: `init_module`, `finit_module`, `delete_module`
- **Namespace escape**: `setns`, `unshare`, `chroot`, `clone3`, `pivot_root`
- **Mount operations**: `mount`, `umount2`, `move_mount`
- **Process control**: `ptrace`, `process_vm_readv`, `process_vm_writev`
- **Privilege escalation**: `open_by_handle_at`, `ioperm`, `iopl`
- **eBPF/perf**: `bpf`, `perf_event_open`, `userfaultfd`
- **Time manipulation**: `clock_settime`, `settimeofday`

Default action: `SCMP_ACT_ERRNO` (deny by default). Dangerous syscalls get `SCMP_ACT_KILL`.

### OCI Security Profile (10 layers)

Every container gets these security options:

1. **Capabilities**: Drop ALL, add back 14 safe defaults
2. **Read-only root filesystem** (optional per deployment)
3. **NoNewPrivileges**: Prevents privilege escalation
4. **Masked paths**: `/proc/kcore`, `/proc/kmem`, `/sys/firmware`
5. **Read-only paths**: `/proc/bus`, `/proc/fs`, `/proc/irq`
6. **Seccomp**: Strict or default profile applied
7. **AppArmor**: Applied if profile loaded in kernel
8. **SELinux**: Label applied if configured
9. **Ulimits**: `NOFILE=65536`, `NPROC=4096`, `MEMLOCK=0`, `CORE=0`
10. **User namespace**: Container root maps to host nobody (UID 65534)

### Exec Command Validation

Shell access can be disabled per container. When disabled, 18 shell variants are blocked (`/bin/sh`, `/bin/bash`, `/usr/bin/zsh`, `/usr/bin/fish`, etc.).

## Encryption

### Data at Rest

| Algorithm | Usage |
|-----------|-------|
| AES-256-GCM | Container state, snapshots, stored data |
| ChaCha20-Poly1305 | Alternative cipher (same security level) |

Snapshots are encrypted with a 32-byte master key. Key rotation re-encrypts all existing snapshots.

### Data in Transit

All P2P traffic encrypted via TLS 1.3 (see Transport Security above).

### Deployment Encryption (E2E)

End-to-end encryption for exec sessions and deployment data:

| Component | Algorithm |
|-----------|-----------|
| Key exchange | X25519 (Elliptic Curve Diffie-Hellman) |
| Key derivation | HKDF with SHA3-256 |
| Data encryption | AES-256-GCM |
| Nonce | 12 bytes random per message |

The provider never sees plaintext deployment keys — only the requester's wallet can decrypt.

## Runtime Isolation

### 3-Tier Provider System

| Tier | Runtime | Isolation | Hardware |
|------|---------|-----------|----------|
| Confidential (Tier 1) | Kata Containers + SEV-SNP | Hardware VM encryption | AMD EPYC with SEV-SNP |
| Standard (Tier 2) | Kata Containers | MicroVM isolation | Any Linux with KVM |
| Dev (Tier 3) | runc / Colima | Container isolation | Linux / macOS |

### SEV-SNP Detection

3-step verification prevents false positives:

1. Check SEV-ES prerequisite (required for SNP)
2. Read sysfs `/sys/module/kvm_amd/parameters/sev_snp`
3. Fallback: parse `/proc/cmdline` for `kvm_amd.sev_snp=1`

Ubuntu 24.04 kernel 6.8 reports `sev_snp=Y` in sysfs but doesn't actually enable it — step 1 catches this.

### Kata Containers

- **Version**: 3.26.0
- **Hypervisor**: QEMU with virtio-fs shared filesystem
- **Memory**: 2GB hugepages reserved for VMs
- **Config**: Standard mode (`vmlinux.container` + disk image)

## Tor Integration

- **Onion service**: Dedicated `.onion` address for API access
- **SOCKS5 proxy**: Context-aware with timeout and cancellation
- **Connection leak prevention**: Drains connections on context cancel
- **WireGuard tunnel**: Tor VPS forwards to main node (no direct exposure)

Deploy containers with Tor-only networking:

```python
result = client.deploy_direct(
    image="python:3.11",
    tor_only=True,
    onion_service=True,
    onion_port=8080,
)
```

## Smart Contract Security

8 audited contracts on Base (Ethereum L2).

| Contract | Security Features |
|----------|-------------------|
| **BunkerToken** | ERC-20, 100B cap, mint/burn. Transfers always available (no pausable on transfers) |
| **BunkerStaking** | Synthetix rewards, 5 tiers, graduated slashing with appeal window, solvency checks (1.20x multiplier) |
| **BunkerEscrow** | 3-provider selection with duplicate check, fee snapshotting, staking verification enforced |
| **BunkerPricing** | Chainlink oracle with roundId validation, staleness bounds [5min, 24h], ceiling division |
| **BunkerTimelock** | 48-hour minimum delay for admin changes, `updateDelay()` blocked, 1-hour pause cooldown |
| **BunkerDelegation** | Co-staking, 7-day unbonding, timelocked reward cut increases |
| **BunkerReputation** | Score 0-1000, bounded deltas (max ±200), decay-adjusted views |
| **BunkerVerification** | Attestation tracking, suspend on challenge, 7-day reinstatement cooldown |

### Audit Results

- **706 Foundry tests** — all passing
- **55 findings** resolved (10 Critical, 22 High, 16 Medium, 7 Low)
- **Slashing**: Disabled by default (monitor mode), enabled via Timelock

### Testnet Contracts (Base Sepolia, Chain 84532)

```
BunkerToken:        0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA
BunkerStaking:      0xDC76d972a827D2a19867EF9aBD335014d5Cf7D6a
BunkerEscrow:       0xBAdaB53a9E98D904E3dfcDb728D510c69DAeE9B4
BunkerPricing:      0x5A61b05F289344202433ccDf44aFc611d9E3dA47
BunkerTimelock:     0xcD8af28808749CD4B55a970f14DA250C8EAEd3C9
BunkerDelegation:   0x071252B4f4bC80cccEccDe1A644229EE2dAf09F5
BunkerReputation:   0x55721fC66B30Fe26a0820CfDeffC0815135678Ed
BunkerVerification: 0x9aA9Fc961da51dcFfF0232883631f7147CaBFBCD
```

### Mainnet Token (Coming Soon)

```
BUNKER Token: 0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213
Chain:        Base (8453)
```

## API Authentication

| Method | Mechanism |
|--------|-----------|
| API Key | `X-API-Key: mb_live_<64hex>` — bcrypt hashed, prefix-based lookup |
| Wallet Inline | EIP-191 per-request signing (`X-Wallet-Address` + `X-Wallet-Signature` headers) |
| Wallet Session | Challenge-response → session token (`Authorization: Bearer wt_<64hex>`) |

## Redundancy & Consensus

- **3-replica deployment** across different geographic regions
- **Gossip-based consensus** with 2/3 majority for status
- **Automatic failover** on replica failure
- **Encrypted snapshots** for warm standby replicas

## Summary

| Layer | Mechanisms |
|-------|------------|
| **Transport** | TLS 1.3 mutual auth, NodeID verification, certificate pinning (TOFU) |
| **Identity** | Ed25519 keys (Argon2id encrypted), Ethereum wallet (Scrypt keystore), TLS cert rotation |
| **Messages** | 8-step validation, replay protection (nonce+timestamp), EIP-191 announce |
| **Sybil** | /24 subnet limiter, eclipse prevention, tiered rate limits, stake gating |
| **Peer Defense** | Behavioral scoring (0.0-1.0), persistent ban list, auto-ban on violations |
| **Containers** | 55 syscalls blocked (seccomp), 10-layer OCI profile, user namespace isolation |
| **Encryption** | AES-256-GCM + ChaCha20 at rest, TLS 1.3 in transit, X25519 ECDH for E2E |
| **Runtime** | Kata Containers (microVM), SEV-SNP (hardware encryption), 3-tier detection |
| **Tor** | Onion service, SOCKS5 proxy, WireGuard tunnel, Tor-only deployments |
| **Contracts** | 8 audited contracts, 706 tests, Timelock admin, graduated slashing |

## Next Steps

- [Quick Start](/docs/quick-start) — Deploy your first container
- [Self-Cloning](/docs/self-cloning) — Threat-triggered protection
- [Python SDK](/docs/python-sdk) — Full SDK documentation
- [API Reference](/docs/api-reference) — REST API endpoints
