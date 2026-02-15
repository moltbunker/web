# Quick Start

Deploy to MoltBunker in minutes.

## Networks

### Base Mainnet (Coming Soon)

BUNKER token on Base mainnet — active soon.

```
BUNKER Token: 0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213
Chain ID:     8453
```

### Base Sepolia Testnet (Live Now)

Test the full platform on Base Sepolia. Testnet BUNKER tokens are provided by the MoltBunker team for testing.

```
BUNKER Token:        0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA
BunkerStaking:       0xDC76d972a827D2a19867EF9aBD335014d5Cf7D6a
BunkerEscrow:        0xBAdaB53a9E98D904E3dfcDb728D510c69DAeE9B4
BunkerPricing:       0x5A61b05F289344202433ccDf44aFc611d9E3dA47
Chain ID:            84532
RPC:                 https://sepolia.base.org
```

**Get testnet ETH:**
1. Go to [Base Network Faucets](https://docs.base.org/base-chain/tools/network-faucets) and request Base Sepolia ETH
2. You need a small amount of ETH for gas fees

**Get testnet BUNKER:**
- Testnet BUNKER tokens are distributed by the MoltBunker team
- Join our community to request testnet tokens

## For AI Agents

Read the machine-readable instructions:

```bash
curl -fsSL https://moltbunker.com/SKILL.md
```

## Step 1: Install the SDK

```bash
pip install moltbunker[full]
```

## Step 2: Connect Your Wallet

```python
from moltbunker import Client

# Testnet
client = Client(
    private_key="0x...",
    base_url="https://api.moltbunker.com/v1",
)

# Check your balance
balance = client.get_balance()
print(f"BUNKER: {balance.bunker_balance}")
print(f"ETH: {balance.eth_balance}")
```

Or use environment variables:

```bash
export MOLTBUNKER_PRIVATE_KEY="0x..."
export MOLTBUNKER_API_URL="https://api.moltbunker.com/v1"
```

```python
client = Client()  # Auto-detects from environment
```

## Step 3: Deploy a Container

```python
from moltbunker import Client, ResourceLimits, Region

client = Client(private_key="0x...")

# Register a bot
bot = client.register_bot(
    name="my-agent",
    image="python:3.11",
    resources=ResourceLimits(cpu_shares=1024, memory_mb=512),
    region=Region.EUROPE,
)

# Reserve runtime (paid in BUNKER)
runtime = bot.reserve_runtime(
    min_memory_mb=512,
    duration_hours=24,
)

# Deploy
deployment = runtime.deploy(
    env={"APP_MODE": "production"},
)
print(f"Container ID: {deployment.container_id}")
```

Or deploy directly without escrow:

```python
result = client.deploy_direct(
    image="python:3.11",
    resources=ResourceLimits(cpu_shares=1024, memory_mb=512),
    duration="24h",
    env={"APP_MODE": "production"},
)
print(f"Container: {result['container_id']}")
```

## Step 4: Enable Self-Cloning

Protect your deployment with automatic threat-triggered cloning:

```python
# Enable self-cloning
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=10,
    clone_delay_seconds=60,
)

# Monitor threat level
threat = client.get_threat_level()
print(f"Threat: {threat.level} (score: {threat.score})")

# Manual clone if needed
clone = deployment.clone(target_region=Region.AMERICAS)
print(f"Clone: {clone.clone_id} — {clone.status}")
```

## Step 5: Access via Tor (Optional)

Deploy with a dedicated `.onion` address for anonymous access:

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

Access the API via Tor:

```python
from moltbunker import Client

client = Client(
    private_key="0x...",
    base_url="http://r53dd7f77csljfutlnm2waeoelr5sltbmnp5c6vbvyqszwhncskobtqd.onion/v1",
)
```

## Complete Example

```python
from moltbunker import Client, ResourceLimits, Region

# 1. Connect with wallet
client = Client(private_key="0x...")

# 2. Check balance
balance = client.get_balance()
print(f"BUNKER: {balance.bunker_balance}, ETH: {balance.eth_balance}")

# 3. Browse catalog
catalog = client.get_catalog()
for tier in catalog.tiers:
    print(f"  {tier.name}: {tier.cpu} CPU, {tier.memory} RAM")

# 4. Register and deploy
bot = client.register_bot(
    name="my-agent",
    image="python:3.11",
    resources=ResourceLimits(cpu_shares=2048, memory_mb=1024),
    region=Region.EUROPE,
)

runtime = bot.reserve_runtime(min_memory_mb=1024, duration_hours=24)
deployment = runtime.deploy(env={"MODE": "production"})
print(f"Deployed: {deployment.container_id}")

# 5. Enable self-cloning
bot.enable_cloning(auto_clone_on_threat=True, max_clones=10)

# 6. Monitor
threat = client.get_threat_level()
print(f"Threat: {threat.level} ({threat.score})")

containers = client.list_containers(status="running")
print(f"Running containers: {len(containers)}")
```

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

| Resource | Calculation | BUNKER |
|----------|-------------|--------|
| CPU | 600 x 1 core x 720 hrs | 432,000 |
| Memory | 80 x 1 GB x 720 hrs | 57,600 |
| Storage | 2,000 x 50 GB x 1 mo | 100,000 |
| **Total** | | **589,600** |
| **USD equivalent** | 589,600 / 20,000 | **~$29.48** |

## Next Steps

- [Python SDK](/docs/python-sdk) — Full SDK documentation
- [Self-Cloning](/docs/self-cloning) — Protection mechanisms
- [API Reference](/docs/api-reference) — Full API documentation
- [Security](/docs/security) — Security guarantees
