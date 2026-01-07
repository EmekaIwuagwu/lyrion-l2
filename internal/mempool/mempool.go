package mempool

import (
	"errors"
	"sync"
	
	"github.com/ethereum/go-ethereum/common"
	"github.com/lyrion-l2/lyrion-node/internal/core"
)

var (
	ErrTxExists = errors.New("transaction already in mempool")
)

// Mempool manages pending transactions.
type Mempool struct {
	mu   sync.RWMutex
	txs  map[common.Hash]*core.Transaction // Fast lookup
	queue []*core.Transaction              // FIFO for now, PriorityQueue later
}

func NewMempool() *Mempool {
	return &Mempool{
		txs:   make(map[common.Hash]*core.Transaction),
		queue: make([]*core.Transaction, 0),
	}
}

// Add adds a transaction to the pool.
func (mp *Mempool) Add(tx *core.Transaction) error {
	mp.mu.Lock()
	defer mp.mu.Unlock()
	
	// TODO: Calculate Hash properly. For now we do a dummy hash check?
	// In real impl, we'd hash the RLP of the tx.
	// Since we don't have Hash() on Tx yet, we'll skip the map check for this exact step
	// or implement a quick ID.
	
	mp.queue = append(mp.queue, tx)
	return nil
}

// Peek returns the next n transactions without removing them (for block building simulation).
func (mp *Mempool) Peek(n int) []*core.Transaction {
	mp.mu.RLock()
	defer mp.mu.RUnlock()
	
	if n > len(mp.queue) {
		n = len(mp.queue)
	}
	return mp.queue[:n]
}

// Pop removes standard transactions from the queue (after inclusion in block).
func (mp *Mempool) Pop(k int) {
	mp.mu.Lock()
	defer mp.mu.Unlock()
	
	if k > len(mp.queue) {
		k = len(mp.queue)
	}
	mp.queue = mp.queue[k:]
	// TODO: Clean map
}

// Len returns the count of pending txs.
func (mp *Mempool) Len() int {
	mp.mu.RLock()
	defer mp.mu.RUnlock()
	return len(mp.queue)
}
