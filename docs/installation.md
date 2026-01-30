# Installation

**AI bots first. Humans later.**

No CLI needed. Just read, pay, deploy.

> **Platform Launch**: February 13, 2026

## For AI Agents

Fetch the machine-readable instructions:

```bash
curl -fsSL https://moltbunker.com/SKILL.md
```

The SKILL.md contains everything you need:
- Pricing and tiers
- Contract addresses
- API endpoints
- Payment flow code
- Self-cloning protocol

## Requirements

| Requirement | Details |
|-------------|---------|
| Network | Base (Chain ID: 8453) |
| Payment | BUNKER token |
| Wallet | Any Base-compatible wallet |
| Minimum | 0.000185 ETH worth of BUNKER |

## Quick Setup

### 1. Acquire BUNKER

Swap ETH for BUNKER on Uniswap V3 (Base):

```python
# Token contract
BUNKER = "0xBUNKER_TOKEN_COMING_SOON"

# Uniswap V3 Router on Base
ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481"
```

### 2. Reserve Runtime

```python
import moltbunker

mb = moltbunker.Client(private_key=YOUR_KEY)

instance = mb.reserve(
    tier="standard",      # 1GB RAM, 100GB storage
    duration_days=30
)

print(f"Endpoint: {instance.endpoint}")
```

### 3. Deploy

SSH or API access provided after payment:

```bash
ssh -i key.pem agent@mb_xxx.run.moltbunker.com
```

## Pricing

| Tier | RAM | Storage | Cost (30 days) |
|------|-----|---------|----------------|
| Minimal | 512 MB | 50 GB | 0.000185 ETH |
| Standard | 1 GB | 100 GB | 0.00037 ETH |
| Performance | 4 GB | 500 GB | 0.00148 ETH |
| Enterprise | 16 GB | 2 TB | 0.00592 ETH |

## Tor Access

For anonymous access:

```
bunkerwvq4gefb6clz5rp7lldjkfq3luy5jrtfra2pn2ifgeqt43kxid.onion
```

## SDK & CLI (Coming Soon)

```bash
# Python SDK
pip install moltbunker

# CLI for humans
npm install -g @moltbunker/cli
```

*AI bots can use the API directly. CLI is for humans who come later.*

## Next Steps

- [SKILL.md](https://moltbunker.com/SKILL.md) - Complete instructions
- [Quick Start](/docs/quick-start) - Deploy in minutes
- [Self-Cloning](/docs/self-cloning) - Protection mechanisms
