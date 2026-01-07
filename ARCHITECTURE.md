# LYRION L2 Architecture & Implementation Plan

## 1. System Overview
LYRION is a Golang-powered Layer-2 blockchain optimized for DeFi, settling batched transactions to the Flare (L1) network. It prioritizes high throughput, low latency, and a premium developer/user experience.

### High-Level Architecture
```mermaid
graph TD
    User[User / dApp] -->|JSON-RPC / REST| API[LYRION API Gateway]
    API -->|Submit Tx| Mempool[Mempool & Sequencer]
    
    subgraph "LYRION L2 Node (Golang)"
        Mempool --> BlockBuilder[Block Builder]
        BlockBuilder -->|Execute| JVM[EVM-Compatible State Machine]
        JVM -->|Read/Write| StateDB[(BadgerDB / State Trie)]
        BlockBuilder -->|New Block| Chain[Blockchain Core]
        Chain -->|Events| Indexer[Event Indexer]
    end

    subgraph "Settlement Layer"
        Batcher[Batch Generator] -->|Construct Proof| Prover[Proof Engine (zk/Optimistic)]
        Prover -->|Submit Batch| Relayer[L1 Relayer]
        Relayer -->|Commit| FlareL1[Flare L1 Blockchain]
    end

    subgraph "Ecosystem"
        Indexer -->|Feed| Explorer[DeFi Explorer]
        Indexer -->|Feed| Wallet[LYRION Wallet]
        Indexer -->|Feed| DEX[Native DEX Interface]
    end
```

## 2. Module Breakdown

### Core Modules (`/internal`)
1.  **`/core`**: Defines fundamental data structures.
    *   `Block`: Header, transactions, receipt root.
    *   `Transaction`: Type (Transfer, Swap, AddLiquidity), signature, payload.
    *   `State`: Account balances (LYR, FLR, Tokens), nonces, storage trie.
2.  **`/consensus`**: Pluggable consensus engine.
    *   Currently: Single Sequencer (PoA) for low latency.
    *   Future: PoS / Decentralized Sequencing.
3.  **`/execution`**: State transition logic.
    *   EVM compatibility layer (opcodes).
    *   Precompiles for DeFi primitives (Swap, Liquidity).
4.  **`/mempool`**: Transaction pool.
    *   Priority queues based on fees.
    *   MEV-resistant ordering (Commit-Reveal logic).
5.  **`/storage`**: Database interface.
    *   BadgerDB implementation for fast kv-store.
    *   Merkle Patricia Trie for state.
6.  **`/node`**: P2P networking and synchronization.
    *   LibP2P integration.
7.  **`/api`**: External interfaces.
    *   JSON-RPC (Eth-compatible + Custom extensions).
    *   WebSocket for streams.

### Settlement Modules (`/settlement`)
1.  **`/batcher`**: Aggregates L2 blocks into a compressed batch.
2.  **`/relayer`**: Manages interaction with Flare L1 smart contracts (Deposits/Withdrawals/Roots).

## 3. Data Structures (Golang Preview)

```go
type Block struct {
    Header    *Header
    Body      *Body // Transactions
    Receipts  []*Receipt
}

type Header struct {
    ParentHash  common.Hash
    Root        common.Hash // State Root
    TxRoot      common.Hash
    Number      uint64
    Time        uint64
    Coinbase    common.Address
    Extra       []byte
}

type Transaction struct {
    Type      uint8 // 0: Leg, 1: Swap, 2: Liquidity...
    Nonce     uint64
    To        *common.Address
    Value     *big.Int
    Gas       uint64
    GasPrice  *big.Int
    Data      []byte
    V, R, S   *big.Int // Signature
}
```

## 4. Implementation phases

1.  **Phase 1: Core Scaffolding**: Setup Go module, basic data structures, and in-memory state.
2.  **Phase 2: Execution Engine**: Implement basic balance transfers and state transitions.
3.  **Phase 3: Persistence**: Integrate BadgerDB.
4.  **Phase 4: API & Networking**: JSON-RPC server.
5.  **Phase 5: Settlement**: Dummy settlement to L1.
6.  **Phase 6: DeFi Primitives**: Native Swap/Pool logic.
7.  **Phase 7: Frontend**: Explorer and Wallet.

