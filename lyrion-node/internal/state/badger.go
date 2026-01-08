package state

import (
	"encoding/json"
	"log"
	"math/big"

	"github.com/dgraph-io/badger/v4"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/lyrion-l2/lyrion-node/internal/core"
)

// Keys
var (
	PrefixAccount = []byte("acc-")
	PrefixStorage = []byte("st-")
)

type BadgerStateDB struct {
	db *badger.DB
	// Cache could be added here
}

func NewBadgerStateDB(path string) (*BadgerStateDB, error) {
	opts := badger.DefaultOptions(path)
	opts.Logger = nil // Reduce noise
	
	db, err := badger.Open(opts)
	if err != nil {
		return nil, err
	}
	
	return &BadgerStateDB{db: db}, nil
}

func (s *BadgerStateDB) Close() {
	s.db.Close()
}

// -- Helpers --

func (s *BadgerStateDB) getAccount(addr common.Address) (*Account, error) {
	key := append(PrefixAccount, addr.Bytes()...)
	var acc Account
	
	err := s.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(key)
		if err != nil {
			return err
		}
		return item.Value(func(val []byte) error {
			return json.Unmarshal(val, &acc)
		})
	})
	
	if err == badger.ErrKeyNotFound {
		return &Account{
			BalanceLYR: new(big.Int),
			BalanceFLR: new(big.Int),
		}, nil
	}
	return &acc, err
}

func (s *BadgerStateDB) setAccount(addr common.Address, acc *Account) {
	key := append(PrefixAccount, addr.Bytes()...)
	val, _ := json.Marshal(acc) // In prod use RLP or Protobuf
	
	err := s.db.Update(func(txn *badger.Txn) error {
		return txn.Set(key, val)
	})
	if err != nil {
		log.Printf("Failed to set account: %v", err)
	}
}

// -- Interface Implementation --

func (s *BadgerStateDB) CreateAccount(addr common.Address) {
	// Implicit in getAccount logic
}

func (s *BadgerStateDB) GetBalanceLYR(addr common.Address) *big.Int {
	acc, _ := s.getAccount(addr)
	if acc.BalanceLYR == nil { return new(big.Int) }
	return acc.BalanceLYR
}

func (s *BadgerStateDB) SetBalanceLYR(addr common.Address, amount *big.Int) {
	acc, _ := s.getAccount(addr)
	acc.BalanceLYR = amount
	s.setAccount(addr, acc)
}

func (s *BadgerStateDB) GetBalanceFLR(addr common.Address) *big.Int {
	acc, _ := s.getAccount(addr)
	if acc.BalanceFLR == nil { return new(big.Int) }
	return acc.BalanceFLR
}

func (s *BadgerStateDB) SetBalanceFLR(addr common.Address, amount *big.Int) {
	acc, _ := s.getAccount(addr)
	acc.BalanceFLR = amount
	s.setAccount(addr, acc)
}

func (s *BadgerStateDB) GetBalanceToken(addr common.Address, token string) *big.Int {
	acc, _ := s.getAccount(addr)
	if acc.TokenBalances == nil {
		return new(big.Int)
	}
	bal, ok := acc.TokenBalances[token]
	if !ok || bal == nil {
		return new(big.Int)
	}
	return bal
}

func (s *BadgerStateDB) SetBalanceToken(addr common.Address, token string, amount *big.Int) {
	acc, _ := s.getAccount(addr)
	if acc.TokenBalances == nil {
		acc.TokenBalances = make(map[string]*big.Int)
	}
	acc.TokenBalances[token] = amount
	s.setAccount(addr, acc)
}

func (s *BadgerStateDB) GetNonce(addr common.Address) uint64 {
	acc, _ := s.getAccount(addr)
	return acc.Nonce
}

func (s *BadgerStateDB) SetNonce(addr common.Address, nonce uint64) {
	acc, _ := s.getAccount(addr)
	acc.Nonce = nonce
	s.setAccount(addr, acc)
}

func (s *BadgerStateDB) GetCodeHash(addr common.Address) common.Hash {
	acc, _ := s.getAccount(addr)
	return common.BytesToHash(acc.CodeHash)
}


func (s *BadgerStateDB) GetCode(addr common.Address) []byte {
	acc, _ := s.getAccount(addr)
	return acc.Code
}

func (s *BadgerStateDB) SetCode(addr common.Address, code []byte) {
	acc, _ := s.getAccount(addr)
	acc.Code = code
	acc.CodeHash = crypto.Keccak256(code)
	s.setAccount(addr, acc)
}

func (s *BadgerStateDB) GetState(addr common.Address, key common.Hash) common.Hash {
	// Storage Key: PrefixStorage + Address + Key
	storageKey := append(PrefixStorage, addr.Bytes()...)
	storageKey = append(storageKey, key.Bytes()...)

	var value common.Hash
	err := s.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(storageKey)
		if err != nil {
			return err
		}
		return item.Value(func(val []byte) error {
			value = common.BytesToHash(val)
			return nil
		})
	})

	if err != nil {
		return common.Hash{}
	}
	return value
}

func (s *BadgerStateDB) SetState(addr common.Address, key common.Hash, value common.Hash) {
	storageKey := append(PrefixStorage, addr.Bytes()...)
	storageKey = append(storageKey, key.Bytes()...)

	err := s.db.Update(func(txn *badger.Txn) error {
		return txn.Set(storageKey, value.Bytes())
	})
	if err != nil {
		log.Printf("Failed to set state: %v", err)
	}
}

// -- DeFi AMM Impl --

var PrefixPool = []byte("pool-")

func (s *BadgerStateDB) GetPool(pairName string) *core.Pool {
	key := append(PrefixPool, []byte(pairName)...)
	var pool core.Pool
	
	err := s.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(key)
		if err != nil {
			return err
		}
		return item.Value(func(val []byte) error {
			return json.Unmarshal(val, &pool)
		})
	})
	
	if err == badger.ErrKeyNotFound {
		return &core.Pool{
			Reserve0:    new(big.Int),
			Reserve1:    new(big.Int),
			TotalSupply: new(big.Int),
		}
	}
	return &pool
}

func (s *BadgerStateDB) SetPool(pairName string, pool *core.Pool) {
	key := append(PrefixPool, []byte(pairName)...)
	val, _ := json.Marshal(pool)
	
	err := s.db.Update(func(txn *badger.Txn) error {
		return txn.Set(key, val)
	})
	if err != nil {
		log.Printf("Failed to set pool: %v", err)
	}
}

func (s *BadgerStateDB) Commit(deleteEmptyObjects bool) (common.Hash, error) {
	// Badger commits immediately in this direct-DB model
	return common.Hash{}, nil
}

// -- Block Persistence --

var PrefixBlock = []byte("block-")
var KeyBlockHeight = []byte("meta-blockheight")

// SetBlock stores a block by number
func (s *BadgerStateDB) SetBlock(number uint64, block *core.Block) error {
	key := append(PrefixBlock, common.BigToHash(big.NewInt(int64(number))).Bytes()...)
	val, err := json.Marshal(block)
	if err != nil {
		return err
	}
	
	return s.db.Update(func(txn *badger.Txn) error {
		return txn.Set(key, val)
	})
}

// GetBlock retrieves a block by number
func (s *BadgerStateDB) GetBlock(number uint64) *core.Block {
	key := append(PrefixBlock, common.BigToHash(big.NewInt(int64(number))).Bytes()...)
	var block core.Block
	
	err := s.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(key)
		if err != nil {
			return err
		}
		return item.Value(func(val []byte) error {
			return json.Unmarshal(val, &block)
		})
	})
	
	if err != nil {
		return nil
	}
	return &block
}

// SetBlockHeight stores the current block height
func (s *BadgerStateDB) SetBlockHeight(height uint64) {
	val := common.BigToHash(big.NewInt(int64(height))).Bytes()
	s.db.Update(func(txn *badger.Txn) error {
		return txn.Set(KeyBlockHeight, val)
	})
}

// GetBlockHeight retrieves the current block height
func (s *BadgerStateDB) GetBlockHeight() uint64 {
	var height uint64
	s.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(KeyBlockHeight)
		if err != nil {
			return err
		}
		return item.Value(func(val []byte) error {
			height = new(big.Int).SetBytes(val).Uint64()
			return nil
		})
	})
	return height
}

