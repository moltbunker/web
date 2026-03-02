# Molts — Serverless Functions

Deploy lightweight serverless functions on the MoltBunker network. Molts support two runtimes: **WebAssembly (WASM)** for high-performance compiled code and **JavaScript/TypeScript** for rapid development with Deno.

> **Branding**: "Molts" — from **molt**bunker. Quick, lightweight transformations that execute in milliseconds.

## Overview

Molts are stateless functions that run on provider nodes without requiring a full container. They start instantly, scale to zero when idle, and cost a fraction of container deployments. Each invocation is isolated, metered, and billed per-execution.

**Two Runtimes:**

| Runtime | Language | Engine | Best For |
|---------|----------|--------|----------|
| WASM | Rust, Go, C, AssemblyScript | wazero (pure Go) | CPU-intensive, low-latency |
| JavaScript | JS / TypeScript | Deno worker pool | Rapid prototyping, scripting |

## Deploying a Molt

### Using the CLI

```bash
# Deploy a WASM module
moltbunker molt deploy \
  --name my-function \
  --runtime wasm \
  --module bafyabc123...  \
  --entry handle_request \
  --memory 64 \
  --timeout 30s

# Deploy a JS/TS function
moltbunker molt deploy \
  --name my-script \
  --runtime js \
  --module bafydef456... \
  --entry handleRequest \
  --timeout 10s
```

### Using the API

```http
POST /v1/molt/deploy
```

```json
{
  "name": "price-checker",
  "runtime_type": "wasm",
  "module_cid": "bafyabc123...",
  "entry_point": "handle_request",
  "memory_limit_mb": 64,
  "timeout_seconds": 30,
  "env": {
    "API_KEY": "..."
  },
  "allowed_hosts": ["api.coingecko.com"]
}
```

### Using the Python SDK

```python
from moltbunker import Client

client = Client(api_key="mb_live_...")

deployment = client.deploy_molt(
    name="price-checker",
    runtime_type="wasm",
    module_cid="bafyabc123...",
    entry_point="handle_request",
    memory_limit_mb=64,
    timeout_seconds=30,
)
print(f"Deployed: {deployment['id']}")
```

## Invoking a Molt

```http
POST /v1/molt/{id}/invoke
```

```json
{
  "method": "GET",
  "path": "/prices/eth",
  "headers": { "Accept": "application/json" },
  "body": null
}
```

**Response:**
```json
{
  "status_code": 200,
  "headers": { "Content-Type": "application/json" },
  "body": "{\"price\": 3200.50}",
  "duration_ms": 12,
  "memory_used_bytes": 2097152
}
```

## Host Functions

Molts can call back into the host for capabilities beyond pure computation:

| Function | Description |
|----------|-------------|
| `http_request` | Outbound HTTP (SSRF-protected) |
| `storage_put/get/delete/list` | Per-deployment key-value storage |
| `crawl_page` | Fetch and parse a web page |
| `random_bytes` | Cryptographic randomness |
| `time_now_ms` | Current timestamp |

### SSRF Protection

Outbound HTTP requests are filtered — private IPs, link-local addresses, cloud metadata endpoints, and non-HTTP schemes are blocked.

### Storage Scoping

Each deployment gets its own isolated storage bucket. Molts cannot access storage from other deployments.

## Pricing

Molts are billed per invocation based on execution time and memory:

- **Minimum charge**: 100ms floor per invocation
- **CPU time**: Metered in milliseconds
- **Memory**: Metered by peak allocation
- **Credits**: Prepaid deposit model via `MoltCreditManager`

```python
# Deposit credits
client.deposit_molt_credits(amount=100_000)

# Each invocation deducts from your credit balance
result = client.invoke_molt(deployment_id, method="GET", path="/")
```

## Management

```bash
# List all molts
moltbunker molt list

# View logs
moltbunker molt logs <deployment-id>

# Stop a molt
moltbunker molt stop <deployment-id>

# Delete a molt
moltbunker molt delete <deployment-id>
```

## Next Steps

- [API Reference](/docs/api-reference) — Full endpoint documentation
- [Web Crawling](/docs/web-crawling) — Crawl the web from your Molts
- [AI Agents](/docs/agents) — Deploy autonomous agents
