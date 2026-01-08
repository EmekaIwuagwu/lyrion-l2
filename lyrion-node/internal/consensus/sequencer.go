package consensus

import (
	"fmt"
	"time"
	"sync"

	"github.com/ethereum/go-ethereum/common"
	"github.com/lyrion-l2/lyrion-node/internal/core"
	"github.com/lyrion-l2/lyrion-node/internal/execution"
	"github.com/lyrion-l2/lyrion-node/internal/mempool"
	"github.com/lyrion-l2/lyrion-node/internal/state"
)

// Sequencer is the single-node block producer.
type Sequencer struct {
	state    state.StateDB
	mempool  *mempool.Mempool
	executor *execution.Executor
	
	currentBlockNumber uint64
	coinbase           common.Address
	
	// In-memory cache for fast access (backed by DB)
	blockCache map[uint64]*core.Block
	mu     sync.RWMutex
}

func NewSequencer(st state.StateDB, mp *mempool.Mempool, exec *execution.Executor, coinbase common.Address) *Sequencer {
	// Load existing block height from DB
	storedHeight := st.GetBlockHeight()
	startHeight := uint64(1)
	
	if storedHeight > 0 {
		startHeight = storedHeight + 1
		fmt.Printf("📜 Loaded block height from DB: %d (next: %d)\n", storedHeight, startHeight)
	}
	
	seq := &Sequencer{
		state:              st,
		mempool:            mp,
		executor:           exec,
		currentBlockNumber: startHeight,
		coinbase:           coinbase,
		blockCache:         make(map[uint64]*core.Block),
	}
	
	// Pre-load recent blocks into cache
	for i := uint64(1); i <= storedHeight && i <= 100; i++ {
		if block := st.GetBlock(i); block != nil {
			seq.blockCache[i] = block
		}
	}
	
	return seq
}

// CurrentHeight returns the next block number to be mined
func (s *Sequencer) CurrentHeight() uint64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.currentBlockNumber
}

// GetBlock returns a block by number (from cache or DB)
func (s *Sequencer) GetBlock(number uint64) *core.Block {
	s.mu.RLock()
	if block, ok := s.blockCache[number]; ok {
		s.mu.RUnlock()
		return block
	}
	s.mu.RUnlock()
	
	// Try to load from DB
	block := s.state.GetBlock(number)
	if block != nil {
		s.mu.Lock()
		s.blockCache[number] = block
		s.mu.Unlock()
	}
	return block
}

// GetLatestBlocks returns n latest blocks
func (s *Sequencer) GetLatestBlocks(n int) []*core.Block {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	var blocks []*core.Block
	start := s.currentBlockNumber - 1
	
	for i := 0; i < n && start > 0; i++ {
		// Check cache first
		if block, ok := s.blockCache[start]; ok {
			blocks = append(blocks, block)
		} else {
			// Try DB
			if block := s.state.GetBlock(start); block != nil {
				blocks = append(blocks, block)
			}
		}
		start--
	}
	return blocks
}

// ProduceBlock creates a new block from mempool transactions.
func (s *Sequencer) ProduceBlock() (*core.Block, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 1. Fetch pending txs
	pending := s.mempool.Peek(100)
	if len(pending) == 0 {
		return nil, fmt.Errorf("no transactions in mempool")
	}

	validTxs := make([]*core.Transaction, 0)
	
	// 2. Execute Transactions
	for _, tx := range pending {
		if tx.From == nil {
			fmt.Println("⚠️ Skipping tx with no sender")
			continue
		}
		
		err := s.executor.ExecuteTransaction(tx, *tx.From)
		if err != nil {
			fmt.Printf("⚠️ Tx Failed: %v\n", err)
			continue
		}
		
		validTxs = append(validTxs, tx)
	}

	if len(validTxs) == 0 {
		s.mempool.Pop(len(pending))
		return nil, fmt.Errorf("all pending transactions failed execution")
	}

	// 3. Create Block
	var parentHash common.Hash
	if s.currentBlockNumber > 1 {
		if parent := s.blockCache[s.currentBlockNumber-1]; parent != nil {
			parentHash = parent.Header.Hash()
		} else if parent := s.state.GetBlock(s.currentBlockNumber-1); parent != nil {
			parentHash = parent.Header.Hash()
		}
	}

	header := &core.Header{
		ParentHash: parentHash,
		Number:     s.currentBlockNumber,
		Time:       uint64(time.Now().Unix()),
		Coinbase:   s.coinbase,
		GasUsed:    21000 * uint64(len(validTxs)),
	}
	
	// 4. Update State (Commit)
	stateRoot, err := s.state.Commit(true)
	if err != nil {
		fmt.Printf("⚠️ State Commit Failed: %v\n", err)
	}
	header.Root = stateRoot
	
	block := core.NewBlock(header, validTxs)
	
	// 5. Store Block (Persist to DB)
	if err := s.state.SetBlock(s.currentBlockNumber, block); err != nil {
		fmt.Printf("⚠️ Failed to persist block: %v\n", err)
	}
	s.blockCache[s.currentBlockNumber] = block
	
	// Update block height in DB
	s.state.SetBlockHeight(s.currentBlockNumber)
	
	// 6. Cleanup Mempool
	s.mempool.Pop(len(pending))
	
	s.currentBlockNumber++
	
	return block, nil
}
