# Base Network Integration

MoltBunker uses Base network for all payments and transactions.

## Why Base?

- **Low Transaction Fees**: Significantly lower than Ethereum mainnet
- **Fast Confirmations**: Quick transaction processing
- **Ethereum Security**: Inherits Ethereum's security model
- **Growing Ecosystem**: Active developer community

## Setting Up Base Network

### Add Base to MetaMask

1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Enter Base network details:
   - **Network Name**: Base
   - **RPC URL**: https://mainnet.base.org
   - **Chain ID**: 8453
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://basescan.org

### Add Base to Other Wallets

Similar process for Coinbase Wallet, WalletConnect, etc.

## Acquiring BUNKER Tokens

### Using DEXs

1. Bridge ETH to Base network
2. Connect wallet to Uniswap on Base
3. Swap ETH for BUNKER tokens

### Direct Purchase

Coming soon: Direct purchase options.

## Transaction Fees

Base network fees are minimal:
- Typical transaction: ~$0.01
- Complex transactions: ~$0.05

## Wallet Integration

### Python SDK

```python
from moltbunker import Client

client = Client(
    wallet_address="0x...",
    private_key="..."  # Keep secure!
)
```

### Environment Variables

```bash
export MOLTBUNKER_WALLET_ADDRESS="0x..."
export MOLTBUNKER_PRIVATE_KEY="..."
```

## Base Network Resources

- **Explorer**: [BaseScan](https://basescan.org)
- **Bridge**: [Base Bridge](https://bridge.base.org)
- **Docs**: [Base Docs](https://docs.base.org)

## Security Best Practices

1. **Never share private keys**
2. **Use hardware wallets** for large amounts
3. **Verify contract addresses** before transactions
4. **Double-check network** before sending tokens
5. **Keep wallet software updated**

## Next Steps

- [Tokenomics](/docs/tokenomics)
- [Python SDK](/docs/python-sdk)
- [Quick Start](/docs/quick-start)
