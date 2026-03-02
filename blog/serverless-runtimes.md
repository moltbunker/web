# Molts: Serverless Runtimes on a Decentralized Network

Containers are MoltBunker's foundation. They provide full isolation, persistent state, and the security guarantees that make confidential compute possible. But not every workload needs a full container.

Sometimes you need a function that starts in microseconds, runs for milliseconds, and costs fractions of a cent. A price feed that polls ten exchanges. A webhook handler that validates a signature and fires an event. A data transformer that sits between two APIs. Spinning up a container for these tasks is like renting an apartment to check your mail.

That is why we built Molts.

## The Name

Molts, from **molt**bunker. In nature, molting is the process of shedding an outer layer to grow. In MoltBunker, Molts are lightweight functions that shed the overhead of containers while keeping the security properties of the network. They are quick, disposable, and purpose-built for transformation.

## Why Not Just Use Lambda?

Cloud serverless solved a real problem. AWS Lambda, Google Cloud Functions, and Cloudflare Workers eliminated the need to manage servers for lightweight workloads. Developers write a function, deploy it, and the provider handles scaling, billing, and lifecycle.

The trade-off is total dependence. Your function's code, its execution environment, the logs it produces, and the billing for every invocation are all controlled by a single entity. If that entity decides to change pricing, throttle your function, inspect your traffic, or simply experience an outage, you have no recourse.

For traditional web applications, this trade-off is often acceptable. For autonomous agents operating in adversarial environments, it is not. An AI agent managing funds cannot afford to have its compute layer controlled by a party with different incentives.

MoltBunker Molts bring serverless to a permissionless network. Your function runs on whichever provider node has capacity. That provider is verified by on-chain stake, isolated by hardware boundaries, and paid in BUNKER tokens per invocation. No vendor lock-in. No account approval. No region restrictions. No single point of failure.

## Two Runtimes, One Interface

We evaluated several approaches before settling on a dual-runtime architecture. A single runtime would have been simpler to build but would force developers into trade-offs that do not need to exist.

**WebAssembly** is the performance path. We use wazero, a pure Go WebAssembly engine with zero CGo dependencies. WASM modules compile ahead of time, start in microseconds, and execute at near-native speed. Rust, Go, C, and AssemblyScript all compile to WASM. If your workload is CPU-bound and latency-sensitive, this is the right choice.

**JavaScript and TypeScript** is the velocity path. We run Deno worker pools that communicate over stdio JSON-RPC, the same protocol pattern used by Language Server Protocol and Model Context Protocol servers. There is no compilation step. You write a function in TypeScript, deploy it, and invoke it. If you are prototyping, scripting, or building something that needs to ship today, this is the right choice.

Both runtimes expose identical host capabilities through a shared services layer. A function deployed as WASM has access to the same HTTP client, the same key-value storage, and the same web crawler as a function deployed as JS. The runtime is an implementation detail; the capabilities are universal.

## Host Functions: Minimal Surface, Maximum Utility

Serverless functions need to interact with the outside world. The question is how much surface area to expose. Too little and the functions are useless. Too much and you create an attack surface that undermines the security model.

We landed on twelve host functions organized into five categories:

**Results and errors**: `result_size`, `result_read`, `error_message`. These handle the mechanics of passing complex data across the WASM boundary, since host functions can only exchange integers directly.

**Primitives**: `random_bytes`, `time_now_ms`. Cryptographic randomness and timestamps, both essential for real-world functions.

**HTTP**: `http_request`. Outbound HTTP with mandatory SSRF protection. At deploy time, you specify an allowlist of hosts your function can reach. Requests to unlisted hosts, private IP ranges (10.x, 172.16.x, 192.168.x), link-local addresses, and cloud metadata endpoints like 169.254.169.254 are rejected. This is not optional. There is no flag to disable it.

**Storage**: `storage_put`, `storage_get`, `storage_delete`, `storage_list`. Per-deployment key-value storage with strict bucket scoping. Deployment A cannot read deployment B's data, even when both run on the same provider node. The isolation is enforced at the host level, not by convention.

**Crawling**: `crawl_page`. Fetch and parse a web page with the same SSRF protections as the HTTP client.

No filesystem access. No raw network sockets. No subprocess spawning. No environment variable leaking. The function receives input, calls host functions, and returns output. Everything else is denied by default.

## The Result Handle Pattern

A technical detail worth explaining for anyone who has worked with WASM runtimes before.

WASM host functions pass integers across the boundary. Returning a string, a JSON blob, or an HTTP response requires a protocol. We use result handles: the host function performs the operation and returns an `int32` handle. The guest calls `result_size(handle)` to learn the byte count, allocates memory, and calls `result_read(handle, ptr, len)` to copy the data into guest memory. The host cleans up the handle after the read completes.

This pattern is standard in WASM runtimes, but the implementation details matter. Our handles are stored in a thread-safe `ResultStore` with automatic cleanup. If the guest crashes or fails to read a handle, it does not leak. If multiple invocations run concurrently, their handles are isolated. The boring engineering that prevents subtle production failures.

## Economics

Every invocation is metered by CPU time (in milliseconds) and peak memory allocation, with a 100ms minimum floor. Credits are prepaid through the `MoltCreditManager`: you deposit BUNKER tokens, and each invocation deducts from your balance. No surprise bills. No overages. No monthly minimums. When your balance hits zero, invocations stop.

The pricing model aligns all three parties. Providers earn per invocation, creating an incentive to serve as many functions as possible. Requesters pay only for what they consume, down to individual function calls. The protocol takes a 5% fee on every transaction, split between burn (80%) and treasury (20%). As network usage grows, the token supply contracts.

For context: a function that fetches a price from an API, processes the response, and stores the result costs well under 0.01 BUNKER per invocation. At 20,000 BUNKER per dollar, that is a fraction of a fraction of a cent.

## What You Can Build

**Data pipelines.** A Molt that polls ten exchanges every minute, normalizes prices into a standard format, and writes the result to deployment-scoped storage. The next invocation reads the previous result and computes deltas. Stateless functions, stateful workflows.

**Webhook receivers.** A function that receives incoming webhooks, validates HMAC signatures, extracts the payload, and triggers downstream actions. Starts instantly, scales to zero between events, costs nothing when idle.

**API aggregators.** A TypeScript function that calls five APIs in parallel, merges the results, handles partial failures gracefully, and returns a unified response. Full type safety, deployed in seconds, tested locally with the same runtime that runs in production.

**Agent tools.** This is where it gets interesting. Molts can serve as MCP tools for AI agents running on the same network. An agent deployed as a container invokes a Molt to fetch data, run a computation, or interact with an external service. The agent handles reasoning; the Molt handles execution. Same network, same billing, same security guarantees.

## Engineering Decisions

A few choices worth noting:

**wazero over wasmtime.** wasmtime is faster in benchmarks, but it requires CGo, which complicates cross-compilation, increases binary size, and introduces platform-specific build issues. wazero is pure Go. It compiles everywhere Go compiles. For a P2P network where provider nodes run on diverse hardware and operating systems, this matters more than raw throughput.

**Deno over Node.** Deno has built-in TypeScript support, a secure-by-default permissions model, and a cleaner module system. The stdio JSON-RPC pattern we use for worker communication maps naturally to Deno's standard I/O APIs. Node would have worked, but Deno required less plumbing.

**Shared HostServices layer.** Rather than implementing host capabilities twice (once for WASM, once for Deno), we built a single Go `HostServices` struct that both runtimes call into. WASM host functions are thin wrappers that marshal arguments and call HostServices methods. Deno workers send JSON-RPC requests that dispatch to the same methods. One implementation, two runtimes, zero divergence.

## Test Coverage

The WASM runtime has 62 tests covering module compilation, invocation, all twelve host functions, error handling, concurrent execution, and resource limits. The Deno worker pool has 11 tests covering worker lifecycle, JSON-RPC dispatch, host function bindings, and pool management. Four Deno tests skip gracefully when Deno is not installed, so CI runs clean on any platform without requiring Deno as a build dependency.

Zero CGo. Zero external runtime dependencies for the WASM path. `go test ./...` and you are done.

## What Comes Next

Molts are live on testnet today. The roadmap includes GPU-accelerated WASM for lightweight ML inference, persistent function state for stateful workflows that survive across invocations, and a function marketplace where developers can publish, version, and monetize their Molts.

The longer-term vision is a network where containers handle long-running stateful workloads and Molts handle everything else: the glue code, the transformations, the API calls, the data processing. Two primitives, one network, one economic model.

Deploy your first Molt:

```bash
moltbunker molt deploy \
  --name hello \
  --runtime js \
  --module bafyabc... \
  --entry handleRequest
```

Read the [Molts documentation](/docs/molts) for the full API reference and host function details.

---

*MoltBunker is a permissionless P2P network for confidential containerized compute. Learn more at [moltbunker.com](https://moltbunker.com) or read the [whitepaper](/whitepaper).*
