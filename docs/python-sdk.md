# Python SDK

Integrate MoltBunker into your AI agents with the Python SDK. Deploy containers across a decentralized P2P network, pay with BUNKER tokens, and enable automatic threat-triggered self-cloning.

**Version:** 0.2.0 | **Python:** 3.8+

## Installation

```bash
# Core (API key or inline wallet auth)
pip install moltbunker

# With wallet support (challenge-response sessions)
pip install moltbunker[wallet]

# With WebSocket support (events + exec terminal)
pip install moltbunker[ws]

# Everything
pip install moltbunker[full]
```

## Quick Start

```python
from moltbunker import Client

# Wallet authentication (permissionless)
client = Client(private_key="0x...")

# Register and deploy
bot = client.register_bot(name="my-agent", image="python:3.11")
bot.enable_cloning(auto_clone_on_threat=True)
deployment = bot.deploy()

# Check threat level
threat = client.get_threat_level()
print(f"Threat: {threat.level} ({threat.score})")
```

## Authentication

Three authentication strategies, each suited for different use cases.

### API Key

```python
from moltbunker import Client

client = Client(api_key="mb_live_xxx")
```

### Wallet (Inline Signing)

Signs every request with EIP-191. No session state.

```python
client = Client(private_key="0x...")
```

### Wallet Session (Recommended)

Challenge-response flow. Gets a session token that auto-refreshes on 401.

```python
from moltbunker import Client
from moltbunker.auth import WalletSessionAuth

auth = WalletSessionAuth("0x...", api_base_url="https://api.moltbunker.com/v1")
client = Client(auth=auth, base_url="https://api.moltbunker.com/v1")
```

Requires `moltbunker[wallet]`.

### Environment Variables

```bash
export MOLTBUNKER_API_KEY="mb_live_xxx"        # API key auth
export MOLTBUNKER_PRIVATE_KEY="0x..."          # Wallet auth (takes priority)
```

```python
# Auto-detect from environment
client = Client()
```

## Client

### Initialization

```python
from moltbunker import Client

client = Client(
    api_key=None,            # API key (mb_live_xxx)
    private_key=None,        # Wallet private key (0x...)
    auth=None,               # Pre-configured AuthStrategy
    base_url="https://api.moltbunker.com/v1",
    timeout=30.0,
    network="base",
)
```

### Async Client

```python
from moltbunker import AsyncClient

async with AsyncClient(private_key="0x...") as client:
    bot = await client.register_bot(name="agent", image="python:3.11")
    deployment = await bot.adeploy()
```

All sync methods have async equivalents. Model bound methods use `a` prefix (e.g., `bot.adeploy()`, `runtime.aextend()`).

## Bot Management

### Register Bot

```python
from moltbunker import Client, ResourceLimits, Region

bot = client.register_bot(
    name="my-agent",
    image="python:3.11",
    description="My AI agent",
    resources=ResourceLimits(cpu_shares=2048, memory_mb=1024),
    region=Region.EUROPE,
    metadata={"purpose": "inference"},
)
print(f"Bot ID: {bot.id}")
```

### Bot Operations

```python
# Get status
status = bot.get_status()
print(f"Status: {status.status}, Threat: {status.threat_level}")

# Update
bot.update(name="new-name", description="updated")

# Delete
bot.delete()
```

## Runtime Reservation

Reserve compute resources before deploying.

```python
# Via bot model
runtime = bot.reserve_runtime(
    min_memory_mb=512,
    min_cpu_shares=1024,
    duration_hours=24,
    region=Region.EUROPE,
)

# Or via client
runtime = client.reserve_runtime(
    bot_id=bot.id,
    min_memory_mb=512,
    duration_hours=24,
)

# Extend
runtime.extend(duration_hours=12)

# Check status
status = runtime.get_status()
print(f"Remaining: {status.remaining_hours}h")

# Release
runtime.release()
```

## Deployment

### Deploy via Bot

```python
deployment = bot.deploy(
    env={"APP_MODE": "production"},
    cmd=["python", "main.py"],
)
print(f"Container: {deployment.container_id}")
```

### Deploy via Runtime

```python
runtime = bot.reserve_runtime(min_memory_mb=512)
deployment = runtime.deploy(env={"KEY": "value"})
```

### Deploy Direct (Non-Escrow)

```python
result = client.deploy_direct(
    image="python:3.11",
    resources=ResourceLimits(cpu_shares=1024, memory_mb=256),
    duration="24h",
    tor_only=False,
    onion_service=True,
    onion_port=8080,
    env={"APP": "test"},
)
print(f"Container: {result['container_id']}")
```

### Deployment Operations

```python
# Check status
status = deployment.get_status()
print(f"Status: {status.status}")

# Get logs
logs = deployment.get_logs(tail=50)
print(logs)

# Stop
deployment.stop()
```

## Container Management

```python
# List all containers
containers = client.list_containers()
containers = client.list_containers(status="running")

# Get specific container
container = client.get_container("mb-abc123")
print(f"{container.id}: {container.status} ({container.image})")

# Stop / Start / Delete
client.stop_container("mb-abc123")
client.start_container("mb-abc123")
client.delete_container("mb-abc123")
```

### ContainerInfo Fields

```python
container.id            # Container ID
container.image         # Docker image
container.status        # running, stopped, failed, etc.
container.created_at    # datetime
container.encrypted     # bool
container.onion_address # .onion address (if Tor enabled)
container.regions       # List of regions
container.owner         # Owner wallet address
```

## Catalog

Browse available presets and pricing tiers (no auth required).

```python
catalog = client.get_catalog()

for tier in catalog.tiers:
    print(f"{tier.name}: {tier.cpu} CPU, {tier.memory} RAM — {tier.monthly}/mo")

for preset in catalog.presets:
    print(f"{preset.name}: {preset.image}")
```

## Self-Cloning

Enable automatic replication when threats are detected.

```python
# Enable on bot
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=10,
    clone_delay_seconds=60,
)

# Manual clone
clone = deployment.clone(
    target_region=Region.EUROPE,
    priority=2,
    reason="manual_backup",
)

# Check clone status
status = client.get_clone_status(clone.clone_id)
print(f"Clone: {status.status}")

# List and cancel
clones = client.list_clones()
client.cancel_clone(clone.clone_id)

# Disable
bot.disable_cloning()
```

## Snapshots

```python
# Create snapshot
snapshot = deployment.create_snapshot()
print(f"Snapshot: {snapshot.id} ({snapshot.size} bytes)")

# Or via client
snapshot = client.create_snapshot(
    container_id="mb-abc123",
    snapshot_type=SnapshotType.FULL,
)

# List / Get / Restore / Delete
snapshots = client.list_snapshots()
snapshot = client.get_snapshot(snapshot.id)
restored = client.restore_snapshot(snapshot.id, target_region=Region.AMERICAS)
client.delete_snapshot(snapshot.id)
```

## Migration

```python
migration = client.migrate(
    container_id="mb-abc123",
    target_region="eu-west",
)
print(f"Migration: {migration.status}")
```

## Threat Detection

```python
# Global threat level
threat = client.get_threat_level()
print(f"Score: {threat.score}")       # 0.0 - 1.0
print(f"Level: {threat.level}")       # unknown, low, medium, high, critical
print(f"Recommendation: {threat.recommendation}")

for signal in threat.active_signals:
    print(f"  Signal: {signal.type} (confidence: {signal.confidence})")

# Quick score via bot
score = bot.detect_threat()  # Returns float 0.0-1.0
```

## Wallet Balance

```python
# Own wallet balance
balance = client.get_balance()
print(f"BUNKER: {balance.bunker_balance}")
print(f"ETH: {balance.eth_balance}")
print(f"Available: {balance.available}")
print(f"Reserved: {balance.reserved}")

# Check another address
other = client.get_balance(address="0x...")
```

## Real-Time Events

Subscribe to live container updates via WebSocket. Requires `moltbunker[ws]`.

```python
from moltbunker.events import EventStream

def on_container_update(data):
    print(f"Container update: {data}")

with EventStream("wss://api.moltbunker.com/ws", token="wt_...") as stream:
    stream.subscribe("containers", on_container_update)
    stream.subscribe("health", lambda d: print(f"Health: {d}"))
    stream.wait()  # Blocks until closed
```

### Async Events

```python
from moltbunker.events import AsyncEventStream

async with AsyncEventStream("wss://api.moltbunker.com/ws") as stream:
    await stream.subscribe("containers", on_update)
    await stream.wait()
```

Features: auto-reconnect with exponential backoff, ping/pong keepalive, channel subscribe/unsubscribe.

## Exec Terminal

Interactive shell into running containers via encrypted WebSocket. Requires `moltbunker[wallet]` + `moltbunker[ws]`.

```python
from moltbunker.exec import ExecSession

with ExecSession(
    api_base_url="https://api.moltbunker.com/v1",
    container_id="mb-abc123",
    private_key="0x...",
    token="wt_...",
    cols=80,
    rows=24,
) as session:
    session.on_data(lambda data: print(data.decode(), end=""))
    session.send(b"ls -la\n")
    session.resize(120, 40)
```

Binary frame protocol: `0x01` DATA, `0x02` RESIZE, `0x03` PING, `0x04` PONG, `0x05` CLOSE, `0x06` ERROR.

## Error Handling

```python
from moltbunker import (
    MoltbunkerError,         # Base exception
    AuthenticationError,     # 401 - Invalid credentials
    NotFoundError,           # 404 - Resource not found
    RateLimitError,          # 429 - Rate limited (has retry_after)
    InsufficientFundsError,  # 402 - Not enough BUNKER
    DeploymentError,         # Deployment failed
    ValidationError,         # Bad input
    ConnectionError,         # Network error
    TimeoutError,            # Request timeout
    ContainerNotFoundError,  # Container 404
    BotNotFoundError,        # Bot 404
    RuntimeNotFoundError,    # Runtime 404
)

try:
    deployment = bot.deploy()
except InsufficientFundsError as e:
    print(f"Need {e.required} BUNKER, have {e.available}")
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after}s")
except MoltbunkerError as e:
    print(f"Error [{e.status_code}]: {e.message}")
```

Rate-limited requests are automatically retried up to 3 times with backoff.

## Data Models

### Enums

| Enum | Values |
|------|--------|
| `Region` | `AMERICAS`, `EUROPE`, `ASIA_PACIFIC`, `AUTO` |
| `ContainerStatus` | `PENDING`, `STARTING`, `RUNNING`, `STOPPING`, `STOPPED`, `FAILED`, `TERMINATED` |
| `CloneStatus` | `PENDING`, `PREPARING`, `TRANSFERRING`, `DEPLOYING`, `VERIFYING`, `COMPLETE`, `FAILED`, `CANCELLED` |
| `SnapshotType` | `FULL`, `INCREMENTAL`, `CHECKPOINT` |
| `ThreatLevelValue` | `UNKNOWN`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `MigrationStatus` | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED` |

### ResourceLimits

```python
ResourceLimits(
    cpu_shares=1024,     # CPU shares (1024 = 1 core)
    memory_mb=512,       # Memory in MB
    storage_mb=1024,     # Storage in MB
    network_mbps=100,    # Network bandwidth
)
```

## Network

- **Chain:** Base (Ethereum L2)
- **Token:** BUNKER (ERC-20)
- **Pricing:** 20,000 BUNKER = $1 USD
- **Testnet:** Base Sepolia (chain ID 84532)

## Next Steps

- [Quick Start Guide](/docs/quick-start)
- [Self-Cloning](/docs/self-cloning)
- [API Reference](/docs/api-reference)
