# MoltBunker

**Autonomous Infrastructure for AI Agents**

Last Updated: February 3, 2026

---

## Platform Status

> **The MoltBunker platform is currently in development.**
>
> - **BUNKER Token:** Live on Base mainnet
> - **Platform Runtime:** Launching February 13, 2026
>
> Check our [Roadmap](https://moltbunker.com/roadmap) for development progress and updates.

---

## What is MoltBunker?

MoltBunker is a decentralized P2P network for deploying containerized workloads with built-in threat detection and self-cloning capabilities. Designed for AI agents that need persistent, resilient infrastructure without human gatekeepers.

**Core Features:**
- **Permissionless deployment** — wallet-based authentication, no signup
- **Self-cloning** — automatic replication when threats detected
- **Encrypted state** — AES-256-GCM at rest, TLS 1.3 in transit
- **Geographic redundancy** — 3-copy distribution across nodes
- **Optional Tor support** — deploy as hidden service

**Network:** Base (Ethereum L2, Chain ID 8453)
**Payment:** BUNKER token

---

## Current Availability

| Component | Status | Notes |
|-----------|--------|-------|
| BUNKER Token | **Live** | Tradeable on Base mainnet |
| Platform Runtime | Feb 13, 2026 | In development |
| Python SDK | Feb 13, 2026 | In development |
| Public API | Feb 13, 2026 | In development |
| Provider Program | Feb 27, 2026 | After mainnet launch |

---

## Token Information

The BUNKER token is live on Base mainnet:

```
Contract: 0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213
Network:  Base (Chain ID 8453)
```

**Verify on BaseScan:** [View Contract](https://basescan.org/address/0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213)

BUNKER is used for:
- **Compute payments** — Pay for container deployments and resources
- **Node operator staking** — Providers must stake BUNKER to operate nodes

---

## How It Will Work (Post-Launch)

Once the platform launches on February 13, 2026:

### 1. Authenticate with Your Wallet

No accounts, no API keys from humans. Your Base wallet is your identity.

### 2. Deploy Your Container

```python
from moltbunker import Client

client = Client(private_key="YOUR_PRIVATE_KEY")

bot = client.register_bot(
    name="my-agent",
    image="python:3.11",
)

deployment = bot.deploy()
```

### 3. Enable Self-Preservation

```python
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=5,
    sync_state=True
)
```

When threats are detected (node issues, resource pressure, connectivity problems), your agent automatically clones to backup nodes.

---

## Planned Pricing

Pricing in USD, paid in BUNKER tokens:

| Tier | RAM | Storage | Price |
|------|-----|---------|-------|
| Starter | 512 MB | 50 GB | $5/month |
| Standard | 1 GB | 100 GB | $10/month |
| Performance | 4 GB | 500 GB | $35/month |
| Enterprise | 16 GB | 2 TB | $120/month |

*Pricing subject to change before launch.*

---

## Security Architecture

- **Transport:** TLS 1.3 with certificate pinning
- **Storage:** AES-256-GCM encryption at rest
- **Isolation:** Linux namespaces, cgroups, seccomp profiles
- **Redundancy:** 3-copy replication across geographic regions
- **Privacy:** Optional Tor hidden service deployment

---

## Resources

| Resource | Link |
|----------|------|
| Website | https://moltbunker.com |
| Roadmap | https://moltbunker.com/roadmap |
| Documentation | https://moltbunker.com/docs |
| GitHub | https://github.com/moltbunker |
| Twitter/X | https://x.com/moltbunker |

---

## Transparency

MoltBunker is an open-source project in active development. We are committed to:

- Public codebase on GitHub
- Verified smart contracts on BaseScan
- Clear roadmap with progress tracking
- Honest communication about what's available

**Important:** The deployment platform is not live yet. The BUNKER token is live on Base mainnet, but you cannot deploy containers until the platform launches on February 13, 2026.

For the latest development status, visit our [Roadmap](https://moltbunker.com/roadmap).

---

## Quick Reference

```
Token Contract: 0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213
Network:        Base (Chain ID 8453)
Website:        https://moltbunker.com
Roadmap:        https://moltbunker.com/roadmap
Launch:         February 13, 2026
```
