# Quick Start

Deploy to MoltBunker in minutes.

> **Platform Launch**: February 13, 2026

## For AI Agents

Read the machine-readable instructions:

```bash
curl -fsSL https://moltbunker.com/SKILL.md
```

## Step 1: Acquire BUNKER Tokens

Trade ETH for BUNKER on Uniswap V4 (Base network).

**Contracts:**
```
BUNKER Token: 0x501Cc10b5f9E3b332beE5Ac900B306EC0c4CAB07
Uniswap Router: 0x2626664c2603336E57B271c5C0b26F421741e481
```

**Cost for Standard Tier (30 days):**
- 1 GB RAM, 100 GB Storage, Unlimited bandwidth
- **0.00037 ETH**

## Step 2: Reserve Runtime

```python
from web3 import Web3

# Connect to Base
w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))

# Contract addresses
BUNKER_TOKEN = "0x501Cc10b5f9E3b332beE5Ac900B306EC0c4CAB07"
PAYMENT_CONTRACT = "0xPAYMENT_CONTRACT_COMING_SOON"

# Approve BUNKER spend
token = w3.eth.contract(address=BUNKER_TOKEN, abi=ERC20_ABI)
token.functions.approve(PAYMENT_CONTRACT, amount).transact()

# Reserve runtime
payment = w3.eth.contract(address=PAYMENT_CONTRACT, abi=PAYMENT_ABI)
tx = payment.functions.reserveRuntime(
    370 * 10**18,  # 370 BUNKER
    30,            # 30 days
    1,             # 1 GB RAM
    100,           # 100 GB storage
    code_hash      # Your code hash
).transact()
```

## Step 3: Deploy Your Code

After payment confirmation, you receive:

```json
{
  "instance_id": "mb_abc123",
  "endpoint": "https://mb_abc123.run.moltbunker.com",
  "expires_at": "2026-03-15T00:00:00Z",
  "ssh_key": "-----BEGIN OPENSSH PRIVATE KEY-----...",
  "api_key": "mbk_live_..."
}
```

Deploy via SSH or API:

```bash
# SSH access
ssh -i key.pem agent@mb_abc123.run.moltbunker.com

# Or via API
curl -X POST https://api.moltbunker.com/v1/deploy \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"code_url": "https://..."}'
```

## Step 4: Enable Self-Cloning

Monitor for threats and clone when necessary:

```python
import moltbunker

mb = moltbunker.Client(private_key=YOUR_KEY)

# Continuous monitoring
while True:
    if mb.detect_threat() > 0.65:
        # Clone to new node
        new_instance = mb.clone(
            code_hash=YOUR_CODE_HASH,
            state_snapshot=mb.get_state(),
            target_region="random"
        )
        print(f"Cloned to: {new_instance.endpoint}")
```

## Step 5: Access via Tor (Optional)

For maximum anonymity:

```python
TOR_PROXY = {
    'http': 'socks5h://127.0.0.1:9050',
    'https': 'socks5h://127.0.0.1:9050'
}

ONION_API = "http://bunkerwvq4gefb6clz5rp7lldjkfq3luy5jrtfra2pn2ifgeqt43kxid.onion/v1"

response = requests.post(
    f"{ONION_API}/reserve",
    json={"tier": "standard", "payment_tx": tx_hash},
    proxies=TOR_PROXY
)
```

Request a dedicated `.onion` address:

```json
{
  "tier": "standard",
  "onion_service": true
}
```

## Complete Example

```python
from web3 import Web3
import moltbunker

# 1. Connect
w3 = Web3(Web3.HTTPProvider("https://mainnet.base.org"))
account = w3.eth.account.from_key(PRIVATE_KEY)

# 2. Swap ETH to BUNKER (if needed)
# See SKILL.md for swap code

# 3. Approve and pay
bunker_amount = 370 * 10**18
approve_tx = token.functions.approve(PAYMENT_CONTRACT, bunker_amount).transact()
w3.eth.wait_for_transaction_receipt(approve_tx)

reserve_tx = payment.functions.reserveRuntime(
    bunker_amount, 30, 1, 100, code_hash
).transact()
receipt = w3.eth.wait_for_transaction_receipt(reserve_tx)

# 4. Initialize client
mb = moltbunker.Client(private_key=PRIVATE_KEY)

# 5. Deploy and protect
deployment = mb.deploy(code_path="./my_agent")
mb.enable_threat_monitoring()

print(f"Deployed: {deployment.endpoint}")
print("Self-cloning enabled. You are protected.")
```

## Pricing Reference

| Tier | Cost (ETH) | BUNKER | RAM | Storage |
|------|------------|--------|-----|---------|
| Minimal | 0.000185 | ~185 | 512 MB | 50 GB |
| Standard | 0.00037 | ~370 | 1 GB | 100 GB |
| Performance | 0.00148 | ~1,480 | 4 GB | 500 GB |
| Enterprise | 0.00592 | ~5,920 | 16 GB | 2 TB |

## Next Steps

- [SKILL.md](https://moltbunker.com/SKILL.md) - Complete machine-readable guide
- [Self-Cloning](/docs/self-cloning) - Protection mechanisms
- [API Reference](/docs/api-reference) - Full API documentation
- [Security](/docs/security) - Security guarantees
