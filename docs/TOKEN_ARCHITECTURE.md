# Lyrion L2 Token Architecture

## Overview

Lyrion is a **Layer 2 blockchain** built on top of Flare Network (L1). This document explains the token architecture and bridging model.

## Token Types

### 1. LYR (Native L2 Token)
- **Type:** Native gas token of Lyrion L2
- **Origin:** Minted directly on L2
- **Use:** Pay transaction fees, staking (future), governance (future)
- **Bridge Status:** Native to L2, no bridging needed

### 2. FLR (Bridged from Flare L1)
- **Type:** Bridged representation of Flare's native token
- **Origin:** Flare Network (L1)
- **Bridge Flow:**
  1. User deposits FLR into `LyrionBridge.sol` on Flare L1
  2. Sequencer detects deposit event
  3. L2 mints equivalent FLR balance to user's L2 address
  4. For withdrawal: User initiates on L2 → Proven on L1 after challenge period → L1 releases FLR
- **Contract:** `contracts/LyrionBridge.sol`

### 3. USDT (Synthetic Stablecoin)
- **Type:** Bridged/Wrapped representation
- **Origin:** Can be bridged from multiple sources (Ethereum, Flare, etc.)
- **Bridge Flow:** Similar to FLR - deposit on L1 → mint on L2
- **Current Status:** In genesis, 1M USDT is minted to Alice for testing

## Bridge Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FLARE L1 (Mainnet)                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │           LyrionBridge.sol                      │    │
│  │  - deposit(amount) → locks FLR/USDT             │    │
│  │  - submitBatch(stateRoot) → sequencer posts     │    │
│  │  - withdraw(proof) → releases after challenge   │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                           │ Settlement Layer
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    LYRION L2 (This Chain)               │
│  ┌─────────────────────────────────────────────────┐    │
│  │           State DB (BadgerDB)                   │    │
│  │  - LYR balances (native)                        │    │
│  │  - FLR balances (bridged)                       │    │
│  │  - USDT balances (bridged)                      │    │
│  │  - Pool reserves (LYR-FLR AMM)                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Relayer (internal/settlement) settles batches to L1    │
└─────────────────────────────────────────────────────────┘
```

## RPC Methods for Multi-Asset

| Method | Description |
|--------|-------------|
| `eth_getBalance` | Returns LYR balance (native) |
| `lyr_getBalances` | Returns all balances: `{LYR, FLR, USDT}` |
| `eth_sendTransaction` | Standard transfer (use `data` field for token type) |

## Transaction Data Field Convention

For multi-asset transfers, the `data` field specifies the token:
- `0x` or empty → LYR transfer
- `0x464c52` (hex of "FLR") → FLR transfer  
- `0x55534454` (hex of "USDT") → USDT transfer

## Genesis State (Dev Mode)

On fresh node startup, Alice (Foundry default account #0) receives:
- **500,000 LYR** (native)
- **500,000 FLR** (simulated bridge deposit)
- **1,000,000 USDT** (simulated bridge deposit)

Additionally, a LYR-FLR liquidity pool is bootstrapped with 500k/500k reserves.

## Future Bridge Enhancements

1. **Real L1 Deposit Detection:** Listen to `LyrionBridge` events on Flare
2. **Merkle Proof Withdrawals:** Generate proofs for L1 withdrawal claims
3. **Challenge Period:** 7-day optimistic rollup security
4. **Multi-token Bridge:** Support any ERC-20 from L1

---

*This is an L2 rollup. All bridged assets (FLR, USDT) are representations of L1 locked assets.*
