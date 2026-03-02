# Smart Contracts

MoltBunker protocol smart contracts deployed on Base Sepolia testnet.

> **Testnet Deployment**: All 9 contracts deployed on Base Sepolia (Chain ID: 84532). Original 8 deployed February 13, 2026. BunkerRegistry deployed February 26, 2026. All verified on Basescan.

## Contract Addresses

| Contract | Address | Description |
|----------|---------|-------------|
| BunkerToken | [`0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA`](https://sepolia.basescan.org/address/0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA) | ERC-20 utility token |
| BunkerStaking | [`0xDC76d972a827D2a19867EF9aBD335014d5Cf7D6a`](https://sepolia.basescan.org/address/0xDC76d972a827D2a19867EF9aBD335014d5Cf7D6a) | Provider staking & rewards |
| BunkerEscrow | [`0xBAdaB53a9E98D904E3dfcDb728D510c69DAeE9B4`](https://sepolia.basescan.org/address/0xBAdaB53a9E98D904E3dfcDb728D510c69DAeE9B4) | Job payment escrow |
| BunkerPricing | [`0x5A61b05F289344202433ccDf44aFc611d9E3dA47`](https://sepolia.basescan.org/address/0x5A61b05F289344202433ccDf44aFc611d9E3dA47) | Oracle-based resource pricing |
| BunkerDelegation | [`0x071252B4f4bC80cccEccDe1A644229EE2dAf09F5`](https://sepolia.basescan.org/address/0x071252B4f4bC80cccEccDe1A644229EE2dAf09F5) | Co-staking delegation |
| BunkerReputation | [`0x55721fC66B30Fe26a0820CfDeffC0815135678Ed`](https://sepolia.basescan.org/address/0x55721fC66B30Fe26a0820CfDeffC0815135678Ed) | Provider reputation scoring |
| BunkerVerification | [`0x9aA9Fc961da51dcFfF0232883631f7147CaBFBCD`](https://sepolia.basescan.org/address/0x9aA9Fc961da51dcFfF0232883631f7147CaBFBCD) | Hardware attestation |
| BunkerTimelock | [`0xcD8af28808749CD4B55a970f14DA250C8EAEd3C9`](https://sepolia.basescan.org/address/0xcD8af28808749CD4B55a970f14DA250C8EAEd3C9) | Admin governance timelock |
| BunkerRegistry | [`0x3559A7D2E6F09eA74a295e654e0D6C22F921D4b5`](https://sepolia.basescan.org/address/0x3559A7D2E6F09eA74a295e654e0D6C22F921D4b5) | Subdomain name registry |

## Contract Overview

### BunkerToken

ERC-20 utility token with a 100 billion supply cap. Supports mint and burn operations. Used as the sole payment method across all MoltBunker services — runtime reservation, self-cloning fees, Tor services, and provider staking.

### BunkerStaking

Synthetix-style staking system for infrastructure providers. Providers stake BUNKER tokens to participate in the network and earn rewards for serving compute jobs. Includes slashing penalties for downtime or misbehavior.

**Staking Tiers:**

| Tier | Minimum Stake | Max Jobs | Reward Multiplier |
|------|---------------|----------|-------------------|
| Starter | 10,000 BUNKER | 5 | 1.0x |
| Bronze | 50,000 BUNKER | 20 | 1.2x |
| Silver | 200,000 BUNKER | 50 | 1.5x |
| Gold | 1,000,000 BUNKER | 200 | 2.0x |
| Platinum | 5,000,000 BUNKER | Unlimited | 3.0x |

### BunkerEscrow

Handles job payment escrow with a 3-provider selection mechanism. When a user submits a job, funds are locked in escrow and progressively released as milestones are completed. Supports dispute resolution and automatic refunds on provider failure.

### BunkerPricing

Integrates Chainlink price oracles to dynamically price compute resources. Covers CPU, memory, storage, and GPU pricing denominated in BUNKER tokens, adjusted for real-time ETH/USD rates.

### BunkerDelegation

Enables co-staking delegation where token holders can delegate their BUNKER to infrastructure providers without transferring ownership. Delegators earn a share of provider rewards proportional to their stake.

### BunkerReputation

On-chain provider reputation scoring system (0-1000 scale). Score is computed from uptime, job completion rate, response latency, and dispute history. Higher reputation unlocks higher-tier jobs and better reward multipliers.

### BunkerVerification

Hardware attestation and provider verification. Providers submit proof of hardware capabilities (CPU, RAM, storage, GPU) which are verified on-chain. Prevents overcommitment and ensures advertised resources match reality.

### BunkerTimelock

Admin governance contract with a minimum execution delay. All protocol parameter changes (pricing updates, slashing thresholds, reward rates) must pass through the timelock, giving the community time to review changes before execution.

### BunkerRegistry

On-chain subdomain name registry for `.moltbunker.dev` vanity names. Users register human-readable names (e.g., `myagent.moltbunker.dev`) that resolve to deployment IDs. Supports name registration, renewal, transfer, metadata, and release. Pricing is length-based — shorter names cost more. Names expire after a configurable period and can be renewed by the owner.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User / AI Agent                       │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Acquire  │───▶│   Approve    │───▶│  Submit Job  │  │
│  │  BUNKER   │    │   Spending   │    │  (Escrow)    │  │
│  └──────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │          BunkerEscrow           │
         │   Lock funds → Select providers │
         │   Progressive release → Refund  │
         └──┬──────────┬──────────┬────────┘
            │          │          │
   ┌────────▼───┐ ┌────▼─────┐ ┌─▼──────────────┐
   │BunkerToken │ │ Bunker   │ │  BunkerPricing  │
   │ ERC-20     │ │ Staking  │ │  Chainlink      │
   │ mint/burn  │ │ 5 tiers  │ │  CPU/mem/GPU    │
   └────────────┘ │ rewards  │ └─────────────────┘
                  │ slashing │
                  └──┬───┬───┘
           ┌─────────▼┐  │  ┌──────────────────┐
           │ Bunker   │  └──▶ BunkerDelegation │
           │Reputation│     │  co-staking       │
           │ 0-1000   │     └──────────────────┘
           └──────────┘
                  │
         ┌────────▼─────────┐
         │BunkerVerification│
         │ hardware proofs  │
         └──────────────────┘

         ┌──────────────────┐
         │ BunkerTimelock   │
         │ governance delay │
         │ admin operations │
         └──────────────────┘
```

## Verification Status

All 9 contracts are source-code verified on Base Sepolia Basescan. You can read and interact with the contracts directly on the explorer:

- [BunkerToken](https://sepolia.basescan.org/address/0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA#code)
- [BunkerStaking](https://sepolia.basescan.org/address/0xDC76d972a827D2a19867EF9aBD335014d5Cf7D6a#code)
- [BunkerEscrow](https://sepolia.basescan.org/address/0xBAdaB53a9E98D904E3dfcDb728D510c69DAeE9B4#code)
- [BunkerPricing](https://sepolia.basescan.org/address/0x5A61b05F289344202433ccDf44aFc611d9E3dA47#code)
- [BunkerDelegation](https://sepolia.basescan.org/address/0x071252B4f4bC80cccEccDe1A644229EE2dAf09F5#code)
- [BunkerReputation](https://sepolia.basescan.org/address/0x55721fC66B30Fe26a0820CfDeffC0815135678Ed#code)
- [BunkerVerification](https://sepolia.basescan.org/address/0x9aA9Fc961da51dcFfF0232883631f7147CaBFBCD#code)
- [BunkerTimelock](https://sepolia.basescan.org/address/0xcD8af28808749CD4B55a970f14DA250C8EAEd3C9#code)
- [BunkerRegistry](https://sepolia.basescan.org/address/0x3559A7D2E6F09eA74a295e654e0D6C22F921D4b5#code)

## Next Steps

- [Tokenomics](/docs/tokenomics) - Token economics and payment flow
- [Base Network](/docs/base-network) - Network setup and wallet configuration
- [API Reference](/docs/api-reference) - Full API documentation
