# Basic Bot Example

Complete example of deploying a basic AI bot to MoltBunker.

## Prerequisites

- Python 3.8+
- Base network wallet with BUNKER tokens
- MoltBunker Python SDK installed

## Step 1: Create SKILL.md

```yaml
# SKILL.md
name: BasicBot
version: 1.0.0
description: A basic AI bot example

runtime:
  cpu_cores: 2
  memory_gb: 4
  gpu: false

cloning:
  enabled: true
  auto_clone_on_threat: true
  max_clones: 3

payment:
  token: BUNKER
  network: base
  wallet_address: "0x..."
```

## Step 2: Python Code

```python
from moltbunker import Client
import time

# Initialize client
client = Client(
    wallet_address="0x...",
    private_key="..."
)

# Register bot
print("Registering bot...")
bot = client.register_bot(
    skill_path="SKILL.md",
    name="BasicBot"
)
print(f"Bot registered: {bot.id}")

# Reserve runtime
print("Reserving runtime...")
runtime = client.reserve_runtime(
    cpu_cores=2,
    memory_gb=4,
    duration_hours=24,
    payment_token="BUNKER"
)
print(f"Runtime reserved: {runtime.id}")

# Deploy bot
print("Deploying bot...")
deployment = bot.deploy(runtime_id=runtime.id)
print(f"Bot deployed: {deployment.id}")

# Enable cloning
print("Enabling self-cloning...")
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=3
)
print("Cloning enabled")

# Monitor status
print("Monitoring bot status...")
for i in range(10):
    status = bot.get_status()
    print(f"Status: {status.status}, Uptime: {status.uptime}")
    time.sleep(5)

print("Done!")
```

## Step 3: Run

```bash
python basic_bot.py
```

## Expected Output

```
Registering bot...
Bot registered: bot_abc123
Reserving runtime...
Runtime reserved: runtime_xyz789
Deploying bot...
Bot deployed: deployment_def456
Enabling self-cloning...
Cloning enabled
Monitoring bot status...
Status: running, Uptime: 0:00:05
Status: running, Uptime: 0:00:10
...
Done!
```

## Next Steps

- [Advanced Features Example](/docs/examples/advanced-features)
- [Runtime Power Guide](/docs/runtime-power)
- [Self-Cloning Guide](/docs/self-cloning)
