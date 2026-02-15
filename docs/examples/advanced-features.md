# Advanced Features Example

Demonstrates snapshots, cloning, real-time events, exec terminal, migration, and error handling.

## Multiple Deployments

```python
from moltbunker import Client, ResourceLimits, Region

client = Client(private_key="0x...")

# Deploy multiple containers across regions
regions = [Region.EUROPE, Region.AMERICAS, Region.ASIA_PACIFIC]
deployments = []

for i, region in enumerate(regions):
    bot = client.register_bot(
        name=f"agent-{i}",
        image="python:3.11-slim",
        resources=ResourceLimits(cpu_shares=1024, memory_mb=512),
        region=region,
    )
    runtime = bot.reserve_runtime(min_memory_mb=512, duration_hours=24)
    deployment = runtime.deploy(env={"REGION": region.value})
    deployments.append(deployment)
    print(f"Deployed agent-{i} in {region.value}: {deployment.container_id}")
```

## Snapshots & Restore

```python
from moltbunker import SnapshotType

# Create a snapshot of a running container
snapshot = deployment.create_snapshot()
print(f"Snapshot: {snapshot.id} ({snapshot.size} bytes)")

# Or create via client with specific type
snapshot = client.create_snapshot(
    container_id="mb-abc123",
    snapshot_type=SnapshotType.FULL,
)

# List all snapshots
snapshots = client.list_snapshots()
for s in snapshots:
    print(f"  {s.id}: {s.snapshot_type} ({s.size} bytes)")

# Restore to a different region
restored = client.restore_snapshot(
    snapshot.id,
    target_region=Region.AMERICAS,
)
print(f"Restored: {restored}")

# Clean up old snapshots
client.delete_snapshot(snapshot.id)
```

## Self-Cloning with Monitoring

```python
import time
from moltbunker import Client, Region

client = Client(private_key="0x...")

# Enable cloning on a bot
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=10,
    clone_delay_seconds=60,
)

# Manual clone to a specific region
clone = deployment.clone(
    target_region=Region.AMERICAS,
    priority=2,
    reason="backup",
)
print(f"Clone: {clone.clone_id} — {clone.status}")

# Monitor clone progress
status = client.get_clone_status(clone.clone_id)
print(f"Clone status: {status.status}")

# List all clones
clones = client.list_clones()
for c in clones:
    print(f"  {c.clone_id}: {c.status}")

# Cancel a clone if needed
client.cancel_clone(clone.clone_id)

# Disable cloning
bot.disable_cloning()
```

## Real-Time Events (WebSocket)

Subscribe to live updates from your containers. Requires `moltbunker[ws]`.

```python
from moltbunker.events import EventStream

def on_container_update(data):
    print(f"Container update: {data['container_id']} → {data['status']}")

def on_health_update(data):
    print(f"Health: {data}")

# Connect and subscribe
with EventStream("wss://api.moltbunker.com/ws", token="wt_...") as stream:
    stream.subscribe("containers", on_container_update)
    stream.subscribe("health", on_health_update)

    # Blocks until stream closes or error
    stream.wait()
```

### Async Events

```python
from moltbunker.events import AsyncEventStream

async with AsyncEventStream("wss://api.moltbunker.com/ws") as stream:
    await stream.subscribe("containers", on_container_update)
    await stream.wait()
```

Features: auto-reconnect with exponential backoff (1s to 30s), ping/pong keepalive, channel subscribe/unsubscribe.

## Exec Terminal (Interactive Shell)

Run commands inside a container via encrypted WebSocket. Requires `moltbunker[wallet]` + `moltbunker[ws]`.

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
    # Receive output
    session.on_data(lambda data: print(data.decode(), end=""))

    # Send commands
    session.send(b"ls -la /app\n")
    session.send(b"python --version\n")

    # Resize terminal
    session.resize(120, 40)
```

Binary frame protocol: `0x01` DATA, `0x02` RESIZE, `0x03` PING, `0x04` PONG, `0x05` CLOSE, `0x06` ERROR.

## Migration

Move a container to a different region:

```python
migration = client.migrate(
    container_id="mb-abc123",
    target_region="eu-west",
)
print(f"Migration: {migration.status}")
```

## Container Management

```python
# List running containers
containers = client.list_containers(status="running")
for c in containers:
    print(f"  {c.id}: {c.image} ({c.status})")

# Get container details
container = client.get_container("mb-abc123")
print(f"Image: {container.image}")
print(f"Status: {container.status}")
print(f"Encrypted: {container.encrypted}")
print(f"Onion: {container.onion_address}")

# Container lifecycle
client.stop_container("mb-abc123")
client.start_container("mb-abc123")
client.delete_container("mb-abc123")

# Get logs
logs = client.get_logs("mb-abc123", tail=100)
print(logs)
```

## Error Handling

```python
from moltbunker import (
    MoltbunkerError,
    AuthenticationError,
    InsufficientFundsError,
    RateLimitError,
    NotFoundError,
    ContainerNotFoundError,
    DeploymentError,
    ValidationError,
    ConnectionError,
    TimeoutError,
)

try:
    deployment = bot.deploy()
except InsufficientFundsError as e:
    print(f"Need {e.required} BUNKER, have {e.available}")
    # Top up wallet before retrying
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after}s")
    # SDK retries automatically up to 3 times
except ContainerNotFoundError:
    print("Container no longer exists")
except AuthenticationError:
    print("Invalid credentials — check API key or wallet")
except DeploymentError as e:
    print(f"Deploy failed: {e.message}")
except MoltbunkerError as e:
    print(f"Error [{e.status_code}]: {e.message}")
```

## Wallet Session Auth

For long-running bots, use session auth to avoid per-request signing:

```python
from moltbunker import Client
from moltbunker.auth import WalletSessionAuth

# Challenge-response flow — gets a session token
auth = WalletSessionAuth(
    "0x...",
    api_base_url="https://api.moltbunker.com/v1",
)
client = Client(auth=auth, base_url="https://api.moltbunker.com/v1")

# Session token auto-refreshes on 401
bot = client.register_bot(name="session-bot", image="python:3.11")
```

Requires `moltbunker[wallet]`.

## Async Client

All methods have async equivalents:

```python
from moltbunker import AsyncClient

async with AsyncClient(private_key="0x...") as client:
    bot = await client.register_bot(name="async-bot", image="python:3.11")
    runtime = await bot.areserve_runtime(min_memory_mb=512)
    deployment = await runtime.adeploy(env={"MODE": "async"})

    threat = await client.get_threat_level()
    print(f"Threat: {threat.level}")

    await deployment.astop()
```

Model bound methods use the `a` prefix: `bot.adeploy()`, `runtime.aextend()`, `deployment.astop()`.

## Pricing Reference

**Rate: 20,000 BUNKER = $1 USD**

| Resource | Cost | Unit |
|----------|------|------|
| CPU | 600 BUNKER | per core-hour |
| Memory | 80 BUNKER | per GB-hour |
| Storage | 2,000 BUNKER | per GB-month |
| Network | 1,000 BUNKER | per GB transferred |
| GPU (Basic) | 10,000 BUNKER | per hour |
| GPU (Pro) | 40,000 BUNKER | per hour |

Browse pricing tiers via the catalog:

```python
catalog = client.get_catalog()
for tier in catalog.tiers:
    print(f"{tier.name}: {tier.cpu} CPU, {tier.memory} RAM — {tier.monthly}/mo")
```

## Next Steps

- [Basic Bot Example](/docs/examples/basic-bot) — Simple deployment walkthrough
- [Python SDK](/docs/python-sdk) — Full SDK reference
- [Security](/docs/security) — Security architecture
- [API Reference](/docs/api-reference) — REST API endpoints
