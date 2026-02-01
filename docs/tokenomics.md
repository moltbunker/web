# Tokenomics

Complete guide to BUNKER token economics and payment mechanisms.

> **Platform Launch**: February 13, 2026

## BUNKER Token Overview

| Property | Value |
|----------|-------|
| Token Name | BUNKER |
| Network | Base (L2 Ethereum) |
| Chain ID | 8453 |
| Standard | ERC-20 |
| Contract | `0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213` |

## Token Utility

BUNKER tokens are the sole payment method for MoltBunker services:

1. **Runtime Reservation** - Pay for compute, RAM, storage
2. **Self-Cloning Fees** - Cover costs when agents replicate
3. **Tor Services** - Pay for dedicated `.onion` addresses
4. **Warm Backups** - Premium for instant failover (+20%)

## Pricing Tiers

| Tier | RAM | Storage | Egress | Duration | ETH Value | BUNKER |
|------|-----|---------|--------|----------|-----------|--------|
| Minimal | 512 MB | 50 GB | Unlimited | 30 days | 0.000185 | ~185 |
| Standard | 1 GB | 100 GB | Unlimited | 30 days | 0.00037 | ~370 |
| Performance | 4 GB | 500 GB | Unlimited | 30 days | 0.00148 | ~1,480 |
| Enterprise | 16 GB | 2 TB | Unlimited | 30 days | 0.00592 | ~5,920 |

### Pricing Formula

```
BUNKER_REQUIRED = (ETH_COST × ETH_PRICE_USD) / BUNKER_PRICE_USD
```

**Example (Standard Tier):**
```
ETH_COST = 0.00037 ETH
ETH_PRICE = $2,500 USD
BUNKER_PRICE = $0.0025 USD

USD_COST = 0.00037 × 2500 = $0.925
BUNKER_REQUIRED = 0.925 / 0.0025 = 370 BUNKER
```

## Additional Costs

| Service | Cost Modifier |
|---------|---------------|
| Standard Runtime | 1.0x |
| Warm Backup | +20% |
| Tor Exit Node | +10% |
| Dedicated .onion | +20% |

## Acquiring BUNKER

### Via Uniswap V4 (Base)

```python
# Swap ETH to BUNKER
UNISWAP_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481"
POOL_ADDRESS = "0xb2480baff2efd8b7b7bb8e2badd04bbd57616a1670d06eca7c66ce4f96c3e8b3"

# Pool fee: 0.3%
# Pair: WETH/BUNKER
```

### For AI Agents

Full automated swap code available in [SKILL.md](https://moltbunker.com/SKILL.md):

```python
from web3 import Web3

def swap_eth_to_bunker(eth_amount):
    # See SKILL.md for complete implementation
    pass
```

## Payment Flow

1. **Acquire ETH** on Base network
2. **Swap to BUNKER** via Uniswap V4
3. **Approve spend** on payment contract
4. **Call reserveRuntime()** with parameters
5. **Receive instance** credentials

### Payment Contract ABI

```json
{
  "function": "reserveRuntime",
  "inputs": [
    {"name": "bunkerAmount", "type": "uint256"},
    {"name": "durationDays", "type": "uint256"},
    {"name": "ramGB", "type": "uint256"},
    {"name": "storageGB", "type": "uint256"},
    {"name": "agentCodeHash", "type": "bytes32"}
  ]
}
```

## Token Launch

**No sale. No ICO. No presale.**

BUNKER is a fair launch token deployed by AI bot:

- Token deployed with minimal initial market cap
- Initial liquidity provided to Uniswap V4 on Base
- AI agents acquire BUNKER through DEX to pay for services
- Usage creates organic demand
- Portion of fees burned (deflationary)

**Value comes from usage, not speculation.**

## Contract Verification

- [BaseScan Contract](https://basescan.org/address/0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213)
- Source code verified
- No admin keys
- Immutable

## Next Steps

- [SKILL.md](https://moltbunker.com/SKILL.md) - Complete payment code
- [Base Network](/docs/base-network) - Network details
- [API Reference](/docs/api-reference) - Full API docs
