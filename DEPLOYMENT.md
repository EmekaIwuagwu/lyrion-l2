# 🌌 LYRION L2 - Production Deployment Guide

## 📋 Overview

LYRION is a high-performance Layer 2 blockchain optimized for DeFi, settling to Flare L1. This guide covers deploying the L1 bridge contracts and configuring the production environment.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LYRION L2 ECOSYSTEM                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Explorer   │  │    Wallet    │  │     DEX      │ │
│  │  Port 3001   │  │  Port 3002   │  │  Port 3003   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Lyrion Node    │                    │
│                  │  RPC: 8545      │                    │
│                  │  P2P: 9000      │                    │
│                  └────────┬────────┘                    │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  L1 Settlement  │                    │
│                  │    Relayer      │                    │
│                  └────────┬────────┘                    │
└───────────────────────────┼─────────────────────────────┘
                            │
                  ┌─────────▼─────────┐
                  │   Flare L1 (C-Chain)  │
                  │  LyrionBridge.sol │
                  │  LyrionToken.sol  │
                  └───────────────────┘
```

---

## 🚀 Deployment Steps

### 1. Prerequisites

- Node.js 18+
- Go 1.21+
- Git
- Flare wallet with FLR for gas

### 2. Deploy L1 Contracts

```bash
cd contracts

# Install dependencies
npm install

# Set your private key (NEVER commit this!)
export PRIVATE_KEY="your_private_key_here"

# Deploy to Flare Coston Testnet
npm run deploy:coston

# Or deploy to Flare Mainnet
npm run deploy:flare
```

**Expected Output:**
```
🚀 Deploying LYRION L2 Bridge Contracts...
📍 Deploying with account: 0x...
✅ LyrionToken deployed to: 0x...
✅ LyrionBridge deployed to: 0x...
💾 Deployment info saved to deployment.json
```

### 3. Update Node Configuration

After deployment, update the node with the contract addresses:

**File: `internal/config/config.go`**
```go
type Config struct {
    // ... existing fields ...
    
    // L1 Bridge Configuration
    BridgeContract string
    TokenContract  string
}
```

**File: `cmd/lyrion-node/main.go`**
```go
// Update relayer initialization
relayer, err := settlement.NewRelayer(
    cfg.FlareRPC,
    seq,
    cfg.BridgeContract, // Use deployed address
    2,
)
```

### 4. Start the Node

```bash
# Set data directory
export LYRION_DATA_DIR="$HOME/.lyrion/data_prod"

# Build
go build -v ./cmd/lyrion-node

# Run
./lyrion-node
```

### 5. Start Frontend Applications

**Explorer:**
```bash
cd lyrion-explorer
npm install
npm run build
npm start # Runs on port 3001
```

**Wallet:**
```bash
cd lyrion-wallet
npm install
npm run build
npm start # Runs on port 3002
```

---

## 🔐 Security Considerations

### Private Key Management

**❌ NEVER:**
- Commit private keys to Git
- Share private keys in plain text
- Use the same key for testnet and mainnet

**✅ DO:**
- Use environment variables
- Use hardware wallets for production
- Rotate keys regularly
- Use different keys for different environments

### Recommended Setup

```bash
# .env file (add to .gitignore!)
LYRION_SEQUENCER_KEY=0x...
LYRION_RELAYER_KEY=0x...
FLARE_RPC_URL=https://flare-api.flare.network/ext/bc/C/rpc
```

---

## 📊 Monitoring

### Node Health Checks

```bash
# Check RPC
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check P2P peers
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"lyr_getNetworkStats","params":[],"id":1}'

# Check settlement status
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"lyr_getSettlementStats","params":[],"id":1}'
```

### Expected Responses

**Block Number:**
```json
{"jsonrpc":"2.0","id":1,"result":"0x5"}
```

**Network Stats:**
```json
{
  "jsonrpc":"2.0",
  "id":1,
  "result":{
    "blockHeight":5,
    "totalTransactions":12,
    "peers":3
  }
}
```

---

## 🔄 Upgrade Process

### 1. Backup Data
```bash
tar -czf lyrion-backup-$(date +%Y%m%d).tar.gz ~/.lyrion/data_prod
```

### 2. Stop Services
```bash
# Stop node
pkill lyrion-node

# Stop frontends
pkill -f "next.*3001"
pkill -f "next.*3002"
```

### 3. Update Code
```bash
git pull origin main
go build -v ./cmd/lyrion-node
```

### 4. Restart Services
```bash
./lyrion-node &
cd lyrion-explorer && npm start &
cd lyrion-wallet && npm start &
```

---

## 🐛 Troubleshooting

### Node Won't Start

**Check logs:**
```bash
tail -f ~/.lyrion/logs/node.log
```

**Common issues:**
- Port 8545 already in use: `lsof -i :8545`
- Database corruption: Delete `~/.lyrion/data_prod` and resync
- P2P port blocked: Check firewall for port 9000

### Settlement Failing

**Check L1 connection:**
```bash
curl https://flare-api.flare.network/ext/bc/C/rpc \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Check relayer balance:**
- Ensure the relayer address has sufficient FLR for gas

### Frontend Not Loading

**Check if node is running:**
```bash
curl http://localhost:8545
```

**Rebuild frontend:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📈 Performance Tuning

### Node Configuration

**For high throughput:**
```go
// cmd/lyrion-node/main.go
ticker := time.NewTicker(1 * time.Second) // Faster block time
```

**For lower latency:**
```go
// internal/mempool/mempool.go
maxSize := 10000 // Larger mempool
```

### Database Optimization

**BadgerDB tuning:**
```go
opts := badger.DefaultOptions(path)
opts.ValueLogFileSize = 256 << 20 // 256MB
opts.NumMemtables = 4
opts.NumLevelZeroTables = 4
```

---

## 📞 Support

- **Documentation:** https://docs.lyrion.network
- **Discord:** https://discord.gg/lyrion
- **GitHub:** https://github.com/lyrion-l2/lyrion-node

---

## 📄 License

MIT License - See LICENSE file for details
