package state

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/lyrion-l2/lyrion-node/internal/core"
)

// Account represents a user or contract account in the state.
// Optimized for dual-token utility (LYR & FLR).
type Account struct {
	Nonce      uint64      `json:"nonce"`
	BalanceLYR *big.Int    `json:"balanceLyr"` // The primary native token
	BalanceFLR *big.Int    `json:"balanceFlr"` // The secondary native token (Flare)
	TokenBalances map[string]*big.Int `json:"tokenBalances,omitempty"` // Other tokens (USDT, etc)
	Root       common.Hash `json:"root"`       // Storage root (nil for EOAs)
	CodeHash   []byte      `json:"codeHash"`   // Code hash (nil for EOAs)
	Code       []byte      `json:"code,omitempty"` // Contract Bytecode
}

// StateDB defines the interface for state manipulation.
type StateDB interface {
	CreateAccount(addr common.Address)
	
	GetBalanceLYR(addr common.Address) *big.Int
	SetBalanceLYR(addr common.Address, amount *big.Int)
	
	GetBalanceFLR(addr common.Address) *big.Int
	SetBalanceFLR(addr common.Address, amount *big.Int)
	
	GetBalanceToken(addr common.Address, token string) *big.Int
	SetBalanceToken(addr common.Address, token string, amount *big.Int)
	
	GetNonce(addr common.Address) uint64
	SetNonce(addr common.Address, nonce uint64)
	
	GetCodeHash(addr common.Address) common.Hash
	GetCode(addr common.Address) []byte
	SetCode(addr common.Address, code []byte)
	
	GetState(addr common.Address, key common.Hash) common.Hash
	SetState(addr common.Address, key common.Hash, value common.Hash)

	// DeFi / AMM Support
	GetPool(pairName string) *core.Pool
	SetPool(pairName string, pool *core.Pool)
	
	// Block Storage
	SetBlock(number uint64, block *core.Block) error
	GetBlock(number uint64) *core.Block
	SetBlockHeight(height uint64)
	GetBlockHeight() uint64
	
	// Commit writes state to the underlying DB and returns the new root.
	Commit(deleteEmptyObjects bool) (common.Hash, error)
}
