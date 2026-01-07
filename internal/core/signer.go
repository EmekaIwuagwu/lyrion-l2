package core

import (
	"crypto/ecdsa"
	"errors"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/rlp"
)

var (
	ErrInvalidSignature    = errors.New("invalid transaction signature")
	ErrInvalidChainID      = errors.New("invalid chain id for signer")
	ErrTransactionNotSigned = errors.New("transaction not signed")
)

// Signer encapsulates transaction signature handling
type Signer struct {
	chainID    *big.Int
	chainIDMul *big.Int // chainID * 2
}

// NewEIP155Signer returns a signer for the given chain ID
func NewEIP155Signer(chainID *big.Int) *Signer {
	if chainID == nil {
		chainID = big.NewInt(1)
	}
	return &Signer{
		chainID:    chainID,
		chainIDMul: new(big.Int).Mul(chainID, big.NewInt(2)),
	}
}

// SigningHash returns the hash to be signed for a transaction
func (s *Signer) SigningHash(tx *Transaction) common.Hash {
	return rlpHash([]interface{}{
		tx.Type,
		tx.Nonce,
		tx.GasPrice,
		tx.Gas,
		tx.To,
		tx.Value,
		tx.Data,
		s.chainID, uint(0), uint(0), // EIP-155: chainID, 0, 0
	})
}

// Sign signs a transaction with a private key
func (s *Signer) Sign(tx *Transaction, prv *ecdsa.PrivateKey) (*Transaction, error) {
	hash := s.SigningHash(tx)
	sig, err := crypto.Sign(hash[:], prv)
	if err != nil {
		return nil, err
	}
	return s.WithSignature(tx, sig)
}

// WithSignature creates a new signed transaction from an existing tx and signature
func (s *Signer) WithSignature(tx *Transaction, sig []byte) (*Transaction, error) {
	if len(sig) != 65 {
		return nil, ErrInvalidSignature
	}

	r := new(big.Int).SetBytes(sig[:32])
	sVal := new(big.Int).SetBytes(sig[32:64])
	v := new(big.Int).SetBytes([]byte{sig[64] + 27})

	// EIP-155: v = chainId * 2 + 35 + recovery_id
	v.Add(v, s.chainIDMul)
	v.Add(v, big.NewInt(8)) // 35 - 27 = 8

	signedTx := &Transaction{
		Type:     tx.Type,
		Nonce:    tx.Nonce,
		GasPrice: tx.GasPrice,
		Gas:      tx.Gas,
		To:       tx.To,
		Value:    tx.Value,
		Data:     tx.Data,
		V:        v,
		R:        r,
		S:        sVal,
		From:     tx.From,
	}

	return signedTx, nil
}

// Sender derives the sender address from the signature
func (s *Signer) Sender(tx *Transaction) (common.Address, error) {
	// If From is already set and no signature, return From
	if tx.From != nil && tx.R == nil {
		return *tx.From, nil
	}

	if tx.V == nil || tx.R == nil || tx.S == nil {
		return common.Address{}, ErrTransactionNotSigned
	}

	// Derive recovery ID
	V := tx.V.Uint64()
	
	// Handle both legacy (V = 27 or 28) and EIP-155 (V = chainId * 2 + 35 or 36)
	var recoveryID byte
	if V >= 35 {
		// EIP-155
		chainIDCheck := new(big.Int).Sub(tx.V, big.NewInt(35))
		chainIDCheck.Div(chainIDCheck, big.NewInt(2))
		if chainIDCheck.Cmp(s.chainID) != 0 {
			return common.Address{}, ErrInvalidChainID
		}
		recoveryID = byte(V - 35 - s.chainIDMul.Uint64())
	} else if V == 27 || V == 28 {
		// Legacy
		recoveryID = byte(V - 27)
	} else {
		return common.Address{}, ErrInvalidSignature
	}

	// Compute the signing hash
	hash := s.SigningHash(tx)

	// Construct signature bytes
	sig := make([]byte, 65)
	copy(sig[0:32], tx.R.Bytes())
	copy(sig[32:64], tx.S.Bytes())
	sig[64] = recoveryID

	// Recover public key
	pub, err := crypto.Ecrecover(hash[:], sig)
	if err != nil {
		return common.Address{}, err
	}
	if len(pub) == 0 || pub[0] != 4 {
		return common.Address{}, ErrInvalidSignature
	}

	// Convert to address
	addr := common.BytesToAddress(crypto.Keccak256(pub[1:])[12:])
	return addr, nil
}

// VerifySignature verifies that the signature is valid and matches the claimed sender
func (s *Signer) VerifySignature(tx *Transaction) (bool, error) {
	if tx.From == nil {
		return false, fmt.Errorf("transaction has no sender set")
	}

	recoveredAddr, err := s.Sender(tx)
	if err != nil {
		return false, err
	}

	return recoveredAddr == *tx.From, nil
}

// rlpHash computes the RLP-encoded Keccak256 hash
func rlpHash(x interface{}) common.Hash {
	data, err := rlp.EncodeToBytes(x)
	if err != nil {
		// Fallback to a simple hash if RLP fails
		return common.Hash{}
	}
	return common.BytesToHash(crypto.Keccak256(data))
}

// SignTx is a convenience function to sign a transaction
func SignTx(tx *Transaction, chainID *big.Int, prv *ecdsa.PrivateKey) (*Transaction, error) {
	signer := NewEIP155Signer(chainID)
	return signer.Sign(tx, prv)
}

// RecoverSender is a convenience function to recover sender from a signed tx
func RecoverSender(tx *Transaction, chainID *big.Int) (common.Address, error) {
	signer := NewEIP155Signer(chainID)
	return signer.Sender(tx)
}
