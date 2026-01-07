package consensus

import (
	"fmt"
	"time"
	"sync" // Added for thread safety

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
	
	// Block history (In-Memory)
	blocks map[uint64]*core.Block
	mu     sync.RWMutex
}

func NewSequencer(st state.StateDB, mp *mempool.Mempool, exec *execution.Executor, coinbase common.Address) *Sequencer {
	return &Sequencer{
		state:              st,
		mempool:            mp,
		executor:           exec,
		currentBlockNumber: 1, // Genesis is 0
		coinbase:           coinbase,
		blocks:             make(map[uint64]*core.Block),
	}
}

// CurrentHeight returns the next block number to be mined
func (s *Sequencer) CurrentHeight() uint64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.currentBlockNumber
}

// GetBlock returns a block by number
func (s *Sequencer) GetBlock(number uint64) *core.Block {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.blocks[number]
}

// GetLatestBlocks returns n latest blocks
func (s *Sequencer) GetLatestBlocks(n int) []*core.Block {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	var blocks []*core.Block
	start := s.currentBlockNumber - 1
	if start < 0 { start = 0 }
	
	for i := 0; i < n; i++ {
		if start == 0 { break }
		if b, ok := s.blocks[start]; ok {
			blocks = append(blocks, b)
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
		// In production, verify signature here and recover 'from'.
		// For now, assume tx.From is properly populated by the API/Client.
		if tx.From == nil {
			fmt.Println("⚠️ Skipping tx with no sender")
			continue
		}
		
		err := s.executor.ExecuteTransaction(tx, *tx.From)
		if err != nil {
			fmt.Printf("⚠️ Tx Failed: %v\n", err)
			// We discard failed txs from the block for this simple version
			// Real EVM includes them with status=0
			continue
		}
		
		validTxs = append(validTxs, tx)
	}

	if len(validTxs) == 0 {
		// All failed?
		s.mempool.Pop(len(pending)) // Remove them anyway so we don't loop forever
		return nil, fmt.Errorf("all pending transactions failed execution")
	}

	// 3. Create Block
	var parentHash common.Hash
	if s.currentBlockNumber > 1 {
		parent := s.blocks[s.currentBlockNumber-1]
		if parent != nil {
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
	// We commit BEFORE finalizing the block to get the State Root
	stateRoot, err := s.state.Commit(true)
	if err != nil {
		fmt.Printf("⚠️ State Commit Failed: %v\n", err)
	}
	header.Root = stateRoot
	
	block := core.NewBlock(header, validTxs)
	
	// Store Block
	s.blocks[s.currentBlockNumber] = block
	
	// 5. Cleanup Mempool
	s.mempool.Pop(len(pending))
	
	s.currentBlockNumber++
	
	return block, nil
}
