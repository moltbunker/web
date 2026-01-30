# Runtime Power

Reserve computation power on-demand for your AI bots. All payments are made using BUNKER tokens on Base network.

## Overview

MoltBunker provides two types of runtime:

- **Warm Runtime**: Always-on infrastructure with instant startup
- **Cold Runtime**: Cost-effective backup systems with quick activation

## Reserving Runtime

### Using Python SDK

```python
from moltbunker import Client

client = Client(wallet_address="0x...", private_key="...")

# Reserve warm runtime
runtime = client.reserve_runtime(
    cpu_cores=4,
    memory_gb=16,
    duration_hours=24,
    runtime_type="warm",
    payment_token="BUNKER"
)
```

### Using CLI

```bash
moltbunker reserve \
  --cpu 4 \
  --memory 16 \
  --duration 24h \
  --type warm
```

## Runtime Types

### Warm Runtime

- **Instant startup**: Always ready when you need it
- **Low latency**: Optimized for real-time operations
- **Premium pricing**: Higher cost for always-on availability

```python
runtime = client.reserve_runtime(
    cpu_cores=4,
    memory_gb=16,
    runtime_type="warm"
)
```

### Cold Runtime

- **Cost-effective**: Pay only when activated
- **Quick activation**: Ready within seconds
- **Backup systems**: Perfect for redundancy

```python
runtime = client.reserve_runtime(
    cpu_cores=4,
    memory_gb=16,
    runtime_type="cold"
)
```

## Payment

All runtime reservations are paid in BUNKER tokens on Base network.

### Payment Flow

1. Ensure your wallet has sufficient BUNKER tokens
2. Reserve runtime (payment is automatic)
3. Runtime is activated immediately
4. Payment is deducted from your wallet

### Pricing

Pricing is dynamic based on:
- CPU cores requested
- Memory (GB) requested
- Runtime type (warm/cold)
- Duration

Check current pricing via API:

```python
pricing = client.get_pricing(
    cpu_cores=4,
    memory_gb=16,
    runtime_type="warm",
    duration_hours=24
)

print(f"Cost: {pricing.cost} BUNKER")
```

## Resource Allocation

### CPU Cores

- Minimum: 1 core
- Maximum: 64 cores per runtime
- Recommended: 2-4 cores for most bots

### Memory

- Minimum: 1 GB
- Maximum: 256 GB per runtime
- Recommended: 4-16 GB for most bots

### GPU (Coming Soon)

GPU support will be available in a future release.

## Managing Runtime

### Extend Runtime

```python
runtime.extend(duration_hours=24)
```

### Release Runtime

```python
runtime.release()
```

### Check Status

```python
status = runtime.get_status()
print(f"Status: {status.status}")
print(f"Remaining time: {status.remaining_hours}h")
```

## Best Practices

1. **Start with cold runtime** for testing and development
2. **Use warm runtime** for production bots that need instant response
3. **Reserve in bulk** for better pricing
4. **Monitor usage** to optimize costs
5. **Enable auto-renewal** for critical bots

## Next Steps

- [Self-Cloning Guide](/docs/self-cloning)
- [Tokenomics](/docs/tokenomics)
- [Base Network Integration](/docs/base-network)
