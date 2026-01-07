package core

import (
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

// Block represents a complete block in the LYRION chain.
type Block struct {
	Header       *Header
	Transactions []*Transaction
}

// Header contains the metadata of a block.
type Header struct {
	ParentHash  common.Hash    `json:"parentHash"`
	Root        common.Hash    `json:"stateRoot"`
	TxRoot      common.Hash    `json:"txRoot"`
	ReceiptRoot common.Hash    `json:"receiptRoot"`
	Number      uint64         `json:"number"`
	Time        uint64         `json:"timestamp"`
	Coinbase    common.Address `json:"coinbase"` // Sequencer address
	Extra       []byte         `json:"extraData"`
	GasUsed     uint64         `json:"gasUsed"`
	GasLimit    uint64         `json:"gasLimit"`
}

// Transaction Types
const (
	TxTypeTransfer     = 0
	TxTypeSwap         = 1 // Swap Token A -> Token B
	TxTypeAddLiquidity = 2 // Add Liquidity to Pool
	TxTypeRemoveLiquidity = 3
)

// Pool represents a liquidity pool in state.
// Key = "TokenA-TokenB" (sorted alphabetically usually, but for LYR-FLR we can enforce canonical order)
type Pool struct {
	Reserve0   *big.Int `json:"reserve0"` // LYR
	Reserve1   *big.Int `json:"reserve1"` // FLR
	TotalSupply *big.Int `json:"totalSupply"` // LP Tokens
}

// Transaction represents a LYRION transaction.
// It supports standard EVM fields but logic will be handled by our custom or standard EVM.
type Transaction struct {
	Type     uint8           `json:"type"`
	Nonce    uint64          `json:"nonce"`
	From     *common.Address `json:"from"` // DEV ONLY: Distinct from signature recovery
	To       *common.Address `json:"to"` // nil for contract creation
	Value    *big.Int        `json:"value"`
	Gas      uint64          `json:"gas"`
	GasPrice *big.Int        `json:"gasPrice"`
	Data     []byte          `json:"data"` // Call data for DeFi ops
	V, R, S  *big.Int        `json:"-"`    // Signature values
}

// NewBlock creates a new Block.
func NewBlock(header *Header, txs []*Transaction) *Block {
	return &Block{
		Header:       header,
		Transactions: txs,
	}
}

// Hash computes the Keccak256 hash of the header.
func (h *Header) Hash() common.Hash {
    return common.BytesToHash(crypto.Keccak256([]byte(fmt.Sprintf("%v%v%d%d", h.ParentHash, h.Root, h.Number, h.Time))))
}

// Hash computes the Keccak256 hash of the transaction.
func (tx *Transaction) Hash() common.Hash {
	return rlpHash(tx)
}



// Sender returns the address derived from the signature (V, R, S).
// Uses EIP-155 signature recovery.
func (tx *Transaction) Sender(chainID *big.Int) (common.Address, error) {
	// If From is already set and no signature, return From (dev mode)
	if tx.From != nil && tx.R == nil {
		return *tx.From, nil
	}
	
	// If no signature at all but From is set, allow it (backwards compat for testing)
	if tx.R == nil && tx.S == nil && tx.V == nil {
		if tx.From != nil {
			return *tx.From, nil
		}
		return common.Address{}, fmt.Errorf("transaction not signed")
	}
	
	// Use the EIP-155 signer for proper recovery
	signer := NewEIP155Signer(chainID)
	return signer.Sender(tx)
}

// Genesis defines the initial state of the chain.
type Genesis struct {
	GenesisTime uint64                      `json:"genesisTime"`
	ChainID     uint64                      `json:"chainId"`
	Alloc       map[common.Address]*big.Int `json:"alloc"` // Initial balances (LYR)
}
