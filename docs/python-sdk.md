# Python SDK

Integrate MoltBunker into your AI bots with our comprehensive Python SDK.

## Installation

```bash
pip install moltbunker
```

## Quick Start

```python
from moltbunker import Client

# Initialize client
client = Client(
    wallet_address="0x...",
    private_key="..."  # Or use MOLTBUNKER_PRIVATE_KEY env var
)

# Register bot
bot = client.register_bot(
    skill_path="SKILL.md",
    name="MyAIBot"
)

# Reserve runtime
runtime = client.reserve_runtime(
    cpu_cores=4,
    memory_gb=16,
    duration_hours=24
)

# Deploy
deployment = bot.deploy(runtime_id=runtime.id)
```

## Client

### Initialization

```python
from moltbunker import Client

client = Client(
    wallet_address="0x...",
    private_key="...",  # Optional if using env var
    network="base",     # Default: "base"
    api_url="https://api.moltbunker.com"  # Optional
)
```

### Environment Variables

```bash
export MOLTBUNKER_WALLET_ADDRESS="0x..."
export MOLTBUNKER_PRIVATE_KEY="..."
export MOLTBUNKER_NETWORK="base"
```

## Bot Management

### Register Bot

```python
bot = client.register_bot(
    skill_path="SKILL.md",
    name="MyAIBot",
    description="My AI bot description"
)
```

### Get Bot

```python
bot = client.get_bot(bot_id="...")
```

### List Bots

```python
bots = client.list_bots()
for bot in bots:
    print(f"{bot.name}: {bot.status}")
```

### Update Bot

```python
bot.update(
    name="NewName",
    description="New description"
)
```

### Delete Bot

```python
bot.delete()
```

## Runtime Management

### Reserve Runtime

```python
runtime = client.reserve_runtime(
    cpu_cores=4,
    memory_gb=16,
    duration_hours=24,
    runtime_type="warm",  # or "cold"
    payment_token="BUNKER"
)
```

### Get Runtime

```python
runtime = client.get_runtime(runtime_id="...")
```

### List Runtimes

```python
runtimes = client.list_runtimes()
```

### Extend Runtime

```python
runtime.extend(duration_hours=24)
```

### Release Runtime

```python
runtime.release()
```

## Deployment

### Deploy Bot

```python
deployment = bot.deploy(runtime_id=runtime.id)
```

### Get Deployment

```python
deployment = bot.get_deployment(deployment_id="...")
```

### List Deployments

```python
deployments = bot.list_deployments()
```

### Stop Deployment

```python
deployment.stop()
```

## Self-Cloning

### Enable Cloning

```python
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=10,
    clone_delay_seconds=60
)
```

### Disable Cloning

```python
bot.disable_cloning()
```

### List Clones

```python
clones = bot.list_clones()
```

### Get Clone Status

```python
status = bot.get_clone_status(clone_id="...")
```

## Status & Monitoring

### Get Bot Status

```python
status = bot.get_status()
print(f"Status: {status.status}")
print(f"Uptime: {status.uptime}")
print(f"Clones: {status.clones}")
```

### Get Runtime Status

```python
status = runtime.get_status()
print(f"Status: {status.status}")
print(f"Remaining: {status.remaining_hours}h")
```

## Error Handling

```python
from moltbunker import MoltBunkerError, InsufficientFundsError

try:
    runtime = client.reserve_runtime(...)
except InsufficientFundsError:
    print("Insufficient BUNKER tokens")
except MoltBunkerError as e:
    print(f"Error: {e}")
```

## Examples

See the [Basic Bot Example](/docs/examples/basic-bot) and [Advanced Features](/docs/examples/advanced-features) for complete examples.

## API Reference

Full API reference available at [API Reference](/docs/api-reference).

## Next Steps

- [Quick Start Guide](/docs/quick-start)
- [Runtime Power](/docs/runtime-power)
- [Self-Cloning](/docs/self-cloning)
