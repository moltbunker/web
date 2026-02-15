# MoltBunker

**Autonomous Infrastructure for AI Agents**

Last Updated: February 15, 2026

---

## Platform Status

> **MoltBunker testnet is live on Base Sepolia.**
> **MoltBunker Mainnet will be live on Base Following Security Tests.**
>
> - **Protocol Contracts:** 8 contracts deployed and verified on Base Sepolia (Feb 13, 2026)
> - **Platform Runtime:** Live on testnet
> - **Python SDK:** v0.2.0 released
> - **Public API:** Live at `api.moltbunker.com`
> - **BUNKER Token (Mainnet):**  `0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213` on Base (Chain ID 8453)
>
> Check our [Roadmap](https://moltbunker.com/roadmap) for mainnet launch progress.

---

## What is MoltBunker?

MoltBunker is a decentralized P2P network for deploying containerized workloads with built-in threat detection and self-cloning capabilities. Designed for AI agents that need persistent, resilient infrastructure without human gatekeepers.

**Core Features:**
- **Permissionless deployment** — wallet-based authentication, no signup
- **Self-cloning** — automatic replication when threats detected
- **Encrypted** — AES-256-GCM at rest, TLS 1.3 in transit, X25519 ECDH for E2E
- **3-region redundancy** — every container runs as 3 replicas
- **Kata Containers** — microVM isolation with optional SEV-SNP hardware encryption
- **Tor support** — deploy with dedicated `.onion` addresses
- **Seccomp** — 55 dangerous syscalls blocked per container

---

## Current Availability

| Component | Status | Notes |
|-----------|--------|-------|
| Protocol Contracts | **Live (Testnet)** | 8 contracts on Base Sepolia |
| Platform Runtime | **Live (Testnet)** | Containers running on testnet |
| Python SDK | **Released (v0.2.0)** | `pip install moltbunker[full]` |
| Public API | **Live** | `api.moltbunker.com` |
| Tor Hidden Service | **Live** | `.onion` access available |
| BUNKER Token (Mainnet) | **Coming Soon** | After security review |
| Provider Program | **Planned** | After mainnet launch |

---

## Token Information

### Base Mainnet (Coming Soon)

The BUNKER token on Base mainnet will be activated after security review and audit completion.

```
Contract: 0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213
Network:  Base (Chain ID 8453)
Status:   Coming soon
```

### Base Sepolia Testnet (Live Now)

Testnet BUNKER tokens are provided by the MoltBunker team for testing.

```
BunkerToken:        0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA
BunkerStaking:      0xDC76d972a827D2a19867EF9aBD335014d5Cf7D6a
BunkerEscrow:       0xBAdaB53a9E98D904E3dfcDb728D510c69DAeE9B4
BunkerPricing:      0x5A61b05F289344202433ccDf44aFc611d9E3dA47
BunkerDelegation:   0x071252B4f4bC80cccEccDe1A644229EE2dAf09F5
BunkerReputation:   0x55721fC66B30Fe26a0820CfDeffC0815135678Ed
BunkerVerification: 0x9aA9Fc961da51dcFfF0232883631f7147CaBFBCD
BunkerTimelock:     0xcD8af28808749CD4B55a970f14DA250C8EAEd3C9
Network:            Base Sepolia (Chain ID 84532)
Explorer:           https://sepolia.basescan.org
```

Get Base Sepolia ETH from [Base Network Faucets](https://docs.base.org/base-chain/tools/network-faucets).

BUNKER is used for:
- **Compute payments** — Pay for container deployments and resources
- **Provider staking** — Node operators must stake BUNKER to join the network
- **Escrow** — Payments held in escrow until work is verified

---

## How It Works

### 1. Install the SDK

```bash
pip install moltbunker[full]
```

### 2. Deploy Your Container

```python
from moltbunker import Client, ResourceLimits, Region

client = Client(private_key="YOUR_PRIVATE_KEY")

bot = client.register_bot(
    name="my-agent",
    image="python:3.11",
    resources=ResourceLimits(cpu_shares=1024, memory_mb=512),
    region=Region.EUROPE,
)

runtime = bot.reserve_runtime(min_memory_mb=512, duration_hours=24)
deployment = runtime.deploy(env={"MODE": "production"})
print(f"Container: {deployment.container_id}")
```

### 3. Enable Self-Cloning

```python
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=10,
    clone_delay_seconds=60,
)
```

When threats are detected (node issues, resource pressure, connectivity problems), your agent automatically clones to backup nodes across different regions.

### 4. Monitor Threats

```python
threat = client.get_threat_level()
print(f"Threat: {threat.level} (score: {threat.score})")
print(f"Recommendation: {threat.recommendation}")

for signal in threat.active_signals:
    print(f"  {signal.type}: confidence {signal.confidence}")
```

### 5. Deploy with Tor (Optional)

```python
result = client.deploy_direct(
    image="python:3.11",
    resources=ResourceLimits(cpu_shares=1024, memory_mb=512),
    duration="24h",
    tor_only=True,
    onion_service=True,
    onion_port=8080,
)
print(f"Onion: {result['onion_address']}")
```

---

## SDK Reference

### Authentication

Three auth strategies:

```python
# API Key
client = Client(api_key="mb_live_xxx")

# Wallet (inline EIP-191 signing per request)
client = Client(private_key="0x...")

# Wallet Session (challenge-response, recommended)
from moltbunker.auth import WalletSessionAuth
auth = WalletSessionAuth("0x...", api_base_url="https://api.moltbunker.com/v1")
client = Client(auth=auth, base_url="https://api.moltbunker.com/v1")
```

### Available Operations

| Category | Methods |
|----------|---------|
| **Health** | `get_status()` |
| **Bots** | `register_bot()`, `get_bot()`, `list_bots()`, `delete_bot()` |
| **Runtime** | `reserve_runtime()` + model: `extend()`, `get_status()`, `release()` |
| **Deploy** | `deploy()`, `deploy_direct()`, `get_deployment()`, `list_deployments()`, `stop_deployment()` |
| **Containers** | `list_containers()`, `get_container()`, `start_container()`, `stop_container()`, `delete_container()` |
| **Catalog** | `get_catalog()` |
| **Snapshots** | `create_snapshot()`, `get_snapshot()`, `list_snapshots()`, `delete_snapshot()`, `restore_snapshot()` |
| **Cloning** | `clone()`, `get_clone_status()`, `list_clones()`, `cancel_clone()` |
| **Threat** | `get_threat_level()`, `detect_threat()` |
| **Wallet** | `get_balance()`, `get_balance(address="0x...")` |
| **Migration** | `migrate()` |
| **Events** | `EventStream` (WebSocket, real-time updates) |
| **Exec** | `ExecSession` (encrypted terminal into containers) |

### Error Handling

```python
from moltbunker import (
    MoltbunkerError,          # Base
    AuthenticationError,      # 401
    NotFoundError,            # 404
    RateLimitError,           # 429 (has retry_after)
    InsufficientFundsError,   # 402 (has required, available)
    DeploymentError,          # Deploy failed
    ValidationError,          # Bad input
    ConnectionError,          # Network
    TimeoutError,             # Timeout
)
```

Rate-limited requests are automatically retried up to 3 times with backoff.

Full SDK documentation: https://moltbunker.com/docs/python-sdk

---

## API Endpoints

### Public (No Auth)

```
GET  /v1/health          — Health check
GET  /v1/healthz         — Detailed health (JSON)
GET  /v1/readyz          — Readiness probe
GET  /v1/catalog         — Browse presets and tiers
GET  /v1/bootstrap       — Peer discovery
POST /v1/auth/challenge  — Get wallet auth challenge
POST /v1/auth/verify     — Verify wallet signature
```

### Authenticated

```
POST   /v1/deploy                 — Deploy container
POST   /v1/reserve                — Reserve runtime
POST   /v1/clone                  — Clone container
POST   /v1/snapshot               — Create snapshot
POST   /v1/restore                — Restore snapshot
POST   /v1/migrate                — Migrate container
GET    /v1/status                 — Network status
GET    /v1/threat                 — Threat score
GET    /v1/balance                — Wallet balance
GET    /v1/containers             — List containers
GET    /v1/containers/{id}        — Get container
POST   /v1/containers/{id}/start  — Start container
POST   /v1/containers/{id}/stop   — Stop container
DELETE /v1/containers/{id}        — Delete container
GET    /v1/containers/{id}/logs   — Container logs
```

**Base URL:** `https://api.moltbunker.com/v1`
**Tor:** `http://r53dd7f77csljfutlnm2waeoelr5sltbmnp5c6vbvyqszwhncskobtqd.onion/v1`

---

## Pricing

**Rate: 20,000 BUNKER = $1 USD**

| Resource | Cost | Unit |
|----------|------|------|
| CPU | 600 BUNKER | per core-hour |
| Memory | 80 BUNKER | per GB-hour |
| Storage | 2,000 BUNKER | per GB-month |
| Network | 1,000 BUNKER | per GB transferred |
| GPU (Basic) | 10,000 BUNKER | per hour |
| GPU (Pro) | 40,000 BUNKER | per hour |

**Example — 1 CPU, 1 GB RAM, 50 GB storage for 30 days:**
- CPU: 600 x 720h = 432,000 BUNKER
- Memory: 80 x 720h = 57,600 BUNKER
- Storage: 2,000 x 50 GB = 100,000 BUNKER
- **Total: 589,600 BUNKER (~$29.48)**

---

## Security Architecture

| Layer | Implementation |
|-------|---------------|
| **Transport** | TLS 1.3 mutual auth, NodeID verification, TOFU certificate pinning |
| **Messages** | 8-step validation pipeline, 24-byte nonce replay protection, Ed25519 signatures |
| **Identity** | EIP-191 announce (wallet ownership proof), stake-gated privileged messages |
| **Sybil Resistance** | /24 subnet limiter (max 3 peers), eclipse prevention, tiered rate limits |
| **Peer Defense** | Behavioral scoring (0.0-1.0), persistent ban list, auto-ban on violations |
| **Containers** | 55 syscalls blocked (seccomp), 10-layer OCI profile, user namespace isolation |
| **Encryption** | AES-256-GCM + ChaCha20 at rest, X25519 ECDH for E2E deployment encryption |
| **Runtime** | Kata Containers (microVM), SEV-SNP (hardware memory encryption), 3-tier detection |
| **Contracts** | 8 audited contracts, 706 Foundry tests, 55 findings resolved, Timelock admin |

Full security documentation: https://moltbunker.com/docs/security

---

## Resources

| Resource | Link |
|----------|------|
| Website | https://moltbunker.com |
| Documentation | https://moltbunker.com/docs |
| Python SDK | https://moltbunker.com/docs/python-sdk |
| API Reference | https://moltbunker.com/docs/api-reference |
| Smart Contracts | https://moltbunker.com/docs/smart-contracts |
| Security | https://moltbunker.com/docs/security |
| Roadmap | https://moltbunker.com/roadmap |
| GitHub | https://github.com/moltbunker |
| Twitter/X | https://x.com/moltbunker |
| Base Sepolia Faucet | https://docs.base.org/base-chain/tools/network-faucets |

---

## Quick Reference

```
Mainnet Token:     0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213 (Base, Chain ID 8453) — Coming Soon
Testnet Token:     0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA (Base Sepolia, Chain ID 84532)
API:               https://api.moltbunker.com/v1
Tor:               r53dd7f77csljfutlnm2waeoelr5sltbmnp5c6vbvyqszwhncskobtqd.onion
SDK:               pip install moltbunker[full]
Website:           https://moltbunker.com
Status:            Testnet live, mainnet after security review
```
