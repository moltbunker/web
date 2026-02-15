# Basic Bot Example

Complete example of deploying a bot to MoltBunker using the Python SDK.

## Prerequisites

- Python 3.8+
- `pip install moltbunker[full]`
- Wallet with BUNKER tokens (testnet or mainnet)

## Step 1: Deploy a Bot

```python
from moltbunker import Client, ResourceLimits, Region

# Authenticate with your wallet
client = Client(private_key="0x...")

# Check balance first
balance = client.get_balance()
print(f"BUNKER: {balance.bunker_balance}")
print(f"ETH: {balance.eth_balance}")

# Register a bot
print("Registering bot...")
bot = client.register_bot(
    name="basic-bot",
    image="python:3.11-slim",
    resources=ResourceLimits(cpu_shares=1024, memory_mb=512),
    region=Region.EUROPE,
)
print(f"Bot registered: {bot.id}")

# Reserve runtime (paid in BUNKER)
print("Reserving runtime...")
runtime = bot.reserve_runtime(
    min_memory_mb=512,
    duration_hours=24,
)
print(f"Runtime reserved: {runtime.id}")

# Deploy
print("Deploying...")
deployment = runtime.deploy(
    env={"APP_MODE": "production"},
)
print(f"Deployed: {deployment.container_id}")

# Enable self-cloning
print("Enabling self-cloning...")
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=3,
)
print("Self-cloning enabled")

# Check status
status = bot.get_status()
print(f"Status: {status.status}")
print(f"Threat level: {status.threat_level}")
```

## Step 2: Monitor Your Bot

```python
import time
from moltbunker import Client

client = Client(private_key="0x...")

# List your running containers
containers = client.list_containers(status="running")
for c in containers:
    print(f"  {c.id}: {c.image} ({c.status})")

# Check threat level
threat = client.get_threat_level()
print(f"Threat: {threat.level} (score: {threat.score})")
print(f"Recommendation: {threat.recommendation}")

for signal in threat.active_signals:
    print(f"  Signal: {signal.type} (confidence: {signal.confidence})")
```

## Step 3: Get Logs

```python
# Get container logs
logs = deployment.get_logs(tail=50)
print(logs)
```

## Step 4: Stop When Done

```python
# Stop the deployment
deployment.stop()

# Release runtime
runtime.release()

# Or delete the bot entirely
bot.delete()
```

## Run It

```bash
export MOLTBUNKER_PRIVATE_KEY="0x..."
python basic_bot.py
```

## Expected Output

```
BUNKER: 1000000.0
ETH: 0.05
Registering bot...
Bot registered: bot-a1b2c3d4
Reserving runtime...
Runtime reserved: rt-e5f6a7b8
Deploying...
Deployed: dep-c9d0e1f2
Enabling self-cloning...
Self-cloning enabled
Status: running
Threat level: low
```

## Deploy Direct (No Escrow)

For quick deployments without the bot registration flow:

```python
from moltbunker import Client, ResourceLimits

client = Client(private_key="0x...")

result = client.deploy_direct(
    image="nginx:alpine",
    resources=ResourceLimits(cpu_shares=512, memory_mb=256),
    duration="24h",
    env={"NGINX_PORT": "8080"},
)
print(f"Container: {result['container_id']}")
```

## Deploy with Tor

```python
result = client.deploy_direct(
    image="python:3.11-slim",
    resources=ResourceLimits(cpu_shares=1024, memory_mb=512),
    duration="24h",
    tor_only=True,
    onion_service=True,
    onion_port=8080,
)
print(f"Container: {result['container_id']}")
print(f"Onion: {result['onion_address']}")
```

## Next Steps

- [Advanced Features](/docs/examples/advanced-features) — Events, exec, snapshots, migration
- [Self-Cloning](/docs/self-cloning) — Threat-triggered protection
- [Python SDK](/docs/python-sdk) — Full SDK reference
