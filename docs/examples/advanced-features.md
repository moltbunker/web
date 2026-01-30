# Advanced Features Example

Example demonstrating advanced MoltBunker features.

## Multiple Bots

```python
from moltbunker import Client

client = Client(wallet_address="0x...", private_key="...")

# Deploy multiple bots
bots = []
for i in range(3):
    bot = client.register_bot(
        skill_path=f"bot_{i}_SKILL.md",
        name=f"Bot{i}"
    )
    bots.append(bot)

# Reserve runtime for all
runtime = client.reserve_runtime(
    cpu_cores=8,
    memory_gb=32,
    duration_hours=168  # 1 week
)

# Deploy all bots
for bot in bots:
    deployment = bot.deploy(runtime_id=runtime.id)
    print(f"{bot.name} deployed: {deployment.id}")
```

## State Synchronization

```python
# Enable state sync for clones
bot.enable_cloning(
    auto_clone_on_threat=True,
    sync_state=True,
    sync_interval_seconds=300
)

# Manual sync
bot.sync_clones()
```

## Monitoring & Alerts

```python
import time
from moltbunker import MoltBunkerError

def monitor_bot(bot_id):
    bot = client.get_bot(bot_id)
    
    while True:
        try:
            status = bot.get_status()
            
            if status.status != "running":
                print(f"Alert: Bot {bot_id} status is {status.status}")
            
            if status.clones < 2:
                print(f"Alert: Bot {bot_id} has only {status.clones} clones")
            
            time.sleep(60)
        except MoltBunkerError as e:
            print(f"Error monitoring bot: {e}")
            time.sleep(60)

# Start monitoring
monitor_bot("bot_123")
```

## Cost Optimization

```python
# Estimate costs before reserving
pricing = client.get_pricing(
    cpu_cores=4,
    memory_gb=16,
    runtime_type="warm",
    duration_hours=24
)

print(f"Warm runtime: {pricing.warm} BUNKER")
print(f"Cold runtime: {pricing.cold} BUNKER")

# Choose cost-effective option
if pricing.cold < pricing.warm * 0.5:
    runtime_type = "cold"
else:
    runtime_type = "warm"

runtime = client.reserve_runtime(
    cpu_cores=4,
    memory_gb=16,
    runtime_type=runtime_type
)
```

## Error Handling

```python
from moltbunker import (
    MoltBunkerError,
    InsufficientFundsError,
    RuntimeNotFoundError
)

try:
    runtime = client.reserve_runtime(...)
except InsufficientFundsError:
    print("Need more BUNKER tokens")
    # Handle insufficient funds
except RuntimeNotFoundError:
    print("Runtime not found")
    # Handle runtime error
except MoltBunkerError as e:
    print(f"Error: {e}")
    # Handle general error
```

## Next Steps

- [API Reference](/docs/api-reference)
- [Python SDK](/docs/python-sdk)
- [Security Guide](/docs/security)
