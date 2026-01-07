package state

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/lyrion-l2/lyrion-node/internal/core"
)

// MemoryStateDB is an in-memory implementation of StateDB for testing/dev.
type MemoryStateDB struct {
	accounts map[common.Address]*Account
	storage  map[common.Address]map[common.Hash]common.Hash
}

// NewMemoryStateDB creates a new in-memory state database.
func NewMemoryStateDB() *MemoryStateDB {
	return &MemoryStateDB{
		accounts: make(map[common.Address]*Account),
		storage:  make(map[common.Address]map[common.Hash]common.Hash),
	}
}

func (db *MemoryStateDB) CreateAccount(addr common.Address) {
	if _, ok := db.accounts[addr]; !ok {
		db.accounts[addr] = &Account{
			BalanceLYR: new(big.Int),
			BalanceFLR: new(big.Int),
		}
	}
}

func (db *MemoryStateDB) GetBalanceLYR(addr common.Address) *big.Int {
	if acc, ok := db.accounts[addr]; ok {
		return new(big.Int).Set(acc.BalanceLYR)
	}
	return common.Big0
}

func (db *MemoryStateDB) SetBalanceLYR(addr common.Address, amount *big.Int) {
	db.CreateAccount(addr)
	db.accounts[addr].BalanceLYR = new(big.Int).Set(amount)
}

func (db *MemoryStateDB) GetBalanceFLR(addr common.Address) *big.Int {
	if acc, ok := db.accounts[addr]; ok {
		return new(big.Int).Set(acc.BalanceFLR)
	}
	return common.Big0
}

func (db *MemoryStateDB) SetBalanceFLR(addr common.Address, amount *big.Int) {
	db.CreateAccount(addr)
	db.accounts[addr].BalanceFLR = new(big.Int).Set(amount)
}

func (db *MemoryStateDB) GetNonce(addr common.Address) uint64 {
	if acc, ok := db.accounts[addr]; ok {
		return acc.Nonce
	}
	return 0
}

func (db *MemoryStateDB) SetNonce(addr common.Address, nonce uint64) {
	db.CreateAccount(addr)
	db.accounts[addr].Nonce = nonce
}

func (db *MemoryStateDB) GetCodeHash(addr common.Address) common.Hash {
	if acc, ok := db.accounts[addr]; ok {
		return common.BytesToHash(acc.CodeHash)
	}
	return common.Hash{}
}

func (db *MemoryStateDB) GetCode(addr common.Address) []byte {
	// For now, in-memory DB doesn't store full code separately, just logic stubs
	// This would need a separate code map in a real implementation
	return nil
}

func (db *MemoryStateDB) SetCode(addr common.Address, code []byte) {
	db.CreateAccount(addr)
	// Simplified: just store hash for now
	// Real impl would hash code and store lookup
}

func (db *MemoryStateDB) GetState(addr common.Address, key common.Hash) common.Hash {
	if storage, ok := db.storage[addr]; ok {
		return storage[key]
	}
	return common.Hash{}
}

func (db *MemoryStateDB) SetState(addr common.Address, key common.Hash, value common.Hash) {
	db.CreateAccount(addr)
	if _, ok := db.storage[addr]; !ok {
		db.storage[addr] = make(map[common.Hash]common.Hash)
	}
	db.storage[addr][key] = value
}

// AMM Stubs
func (db *MemoryStateDB) GetPool(pairName string) *core.Pool {
	return &core.Pool{
		Reserve0:    new(big.Int),
		Reserve1:    new(big.Int),
		TotalSupply: new(big.Int),
	}
}
func (db *MemoryStateDB) SetPool(pairName string, pool *core.Pool) {}

func (db *MemoryStateDB) Commit(deleteEmptyObjects bool) (common.Hash, error) {
	// In-memory doesn't actually need to "commit" to disk, but we return a fake root
	// In production this calculates the Merkle Root
	return common.Hash{}, nil
}
