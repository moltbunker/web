# Web Crawling

Crawl and extract data from websites across the MoltBunker network. Jobs run on provider nodes with optional Tor routing, JavaScript rendering, and CSS selector extraction.

## Overview

The crawling service handles multi-page website crawling with configurable depth, domain restrictions, and content extraction. Each crawl job runs asynchronously and reports results as pages are processed.

**Capabilities:**

- Multi-URL seed crawling with configurable depth and page limits
- Domain-scoped crawling (restrict to seed domains or allow cross-domain)
- CSS selector extraction for structured data
- JavaScript rendering for SPA content
- Screenshot capture per page
- Tor routing for anonymous crawling
- robots.txt compliance (optional)

## Creating a Crawl Job

### Using the API

```http
POST /v1/crawl/jobs
```

```json
{
  "urls": ["https://example.com"],
  "max_depth": 3,
  "max_pages": 100,
  "allowed_domains": ["example.com"],
  "selectors": {
    "title": "h1",
    "price": ".product-price",
    "description": "meta[name=description]"
  },
  "options": {
    "javascript": true,
    "screenshot": false,
    "tor": false,
    "respect_robots": true
  },
  "timeout_seconds": 300
}
```

**Response:**
```json
{
  "id": "crawl_abc123",
  "status": "pending",
  "config": { ... },
  "created_at": "2026-03-01T12:00:00Z"
}
```

### Using the CLI

```bash
moltbunker crawl start \
  --url https://example.com \
  --depth 3 \
  --max-pages 100 \
  --domain example.com \
  --selector "title=h1" \
  --selector "price=.product-price" \
  --javascript \
  --timeout 5m
```

### Using the Python SDK

```python
from moltbunker import Client

client = Client(api_key="mb_live_...")

job = client.create_crawl_job(
    urls=["https://example.com"],
    max_depth=3,
    max_pages=100,
    selectors={"title": "h1", "price": ".product-price"},
    javascript=True,
)
print(f"Job started: {job['id']}")
```

## Crawl Results

Each crawled page produces a result with content, metadata, and extracted data:

```http
GET /v1/crawl/jobs/{id}/results
```

```json
[
  {
    "url": "https://example.com/products/widget",
    "status_code": 200,
    "content_type": "text/html",
    "title": "Premium Widget",
    "text": "Full page text content...",
    "byte_size": 45230,
    "duration_ms": 340,
    "selectors": {
      "title": "Premium Widget",
      "price": "$29.99"
    },
    "links": [
      "https://example.com/products/gadget",
      "https://example.com/about"
    ]
  }
]
```

## Crawl Statistics

Get aggregate statistics across all your crawl jobs:

```http
GET /v1/crawl/stats
```

```json
{
  "total_jobs": 42,
  "running_jobs": 2,
  "completed_jobs": 38,
  "failed_jobs": 2,
  "total_pages": 12500,
  "total_bytes": 524288000
}
```

## Job Management

```bash
# List all crawl jobs
moltbunker crawl list

# Check job status
moltbunker crawl status <job-id>

# Cancel a running job
moltbunker crawl cancel <job-id>

# Crawl a single page (quick mode)
moltbunker crawl page https://example.com
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `urls` | string[] | required | Seed URLs to start crawling |
| `max_depth` | int | 3 | Maximum link-following depth |
| `max_pages` | int | 100 | Maximum pages to crawl |
| `allowed_domains` | string[] | seed domains | Restrict crawling to these domains |
| `selectors` | map | none | CSS selectors for data extraction |
| `javascript` | bool | false | Enable JS rendering |
| `screenshot` | bool | false | Capture page screenshots |
| `tor` | bool | false | Route through Tor network |
| `respect_robots` | bool | true | Honor robots.txt directives |
| `timeout_seconds` | int | 300 | Job timeout |

## Next Steps

- [Molts](/docs/molts) — Run serverless functions on crawled data
- [AI Agents](/docs/agents) — Build agents that crawl and reason
- [API Reference](/docs/api-reference) — Full endpoint documentation
