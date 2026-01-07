package execution

import (
	"errors"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/lyrion-l2/lyrion-node/internal/core"
	"github.com/lyrion-l2/lyrion-node/internal/state"
)

var (
	ErrInsufficientBalance    = errors.New("insufficient balance")
	ErrInvalidNonce           = errors.New("invalid nonce")
	ErrPoolExists             = errors.New("pool already exists")
	ErrSlippage               = errors.New("insufficient output amount")
	ErrInsufficientLiquidity  = errors.New("insufficient liquidity")
)

// Executor handles transaction execution against the state.
type Executor struct {
	state state.StateDB
}

// NewExecutor creates a new transaction executor.
func NewExecutor(state state.StateDB) *Executor {
	return &Executor{state: state}
}

// ExecuteTransaction applies a transaction to the state.
func (e *Executor) ExecuteTransaction(tx *core.Transaction, from common.Address) error {
	// 1. Nonce Check
	currentNonce := e.state.GetNonce(from)
	if tx.Nonce != currentNonce {
		return fmt.Errorf("%w: expected %d, got %d", ErrInvalidNonce, currentNonce, tx.Nonce)
	}

	// 2. Route by Type
	var err error
	switch tx.Type {
	case core.TxTypeTransfer:
		err = e.executeTransfer(tx, from)
	case core.TxTypeAddLiquidity:
		err = e.executeAddLiquidity(tx, from)
	case core.TxTypeSwap:
		err = e.executeSwap(tx, from)
	default:
		return fmt.Errorf("unknown transaction type: %d", tx.Type)
	}
	
	if err != nil {
		return err
	}

	// 3. Increment Nonce (on success)
	e.state.SetNonce(from, currentNonce+1)
	return nil
}

func (e *Executor) executeTransfer(tx *core.Transaction, from common.Address) error {
	// Determine Token (Default to LYR if Data is empty)
	token := "LYR"
	if len(tx.Data) > 0 {
		token = string(tx.Data)
	}

	// 1. Get Balance
	var balance *big.Int
	if token == "LYR" {
		balance = e.state.GetBalanceLYR(from)
	} else if token == "FLR" {
		balance = e.state.GetBalanceFLR(from)
	} else {
		balance = e.state.GetBalanceToken(from, token)
	}
	
	// 2. Gas Logic (Always paid in LYR)
	// Only deduct gas if paying from LYR balance, OR check LYR balance separately
	gasPrice := tx.GasPrice
	if gasPrice == nil {
		gasPrice = big.NewInt(1000000000) // 1 Gwei
	}
	gasCost := new(big.Int).Mul(new(big.Int).SetUint64(tx.Gas), gasPrice)
	
	// Check Gas Balance (LYR)
	lyrBalance := e.state.GetBalanceLYR(from)
	if lyrBalance.Cmp(gasCost) < 0 {
		return fmt.Errorf("insufficient LYR for gas")
	}
	
	// Deduct Gas
	e.state.SetBalanceLYR(from, new(big.Int).Sub(lyrBalance, gasCost))
	
	// 3. Check Transfer Balance
	// If transferring LYR, careful not to double count gas if we just deducted it?
	// Actually, we fetched 'balance' BEFORE gas deduction.
	// If token is LYR, we need to re-fetch or adjust.
	if token == "LYR" {
		// Refetch updated LYR balance after gas deduction
		balance = e.state.GetBalanceLYR(from)
	}
	
	if balance.Cmp(tx.Value) < 0 {
		return fmt.Errorf("insufficient %s balance", token)
	}
	
	// 4. Deduct Transfer Amount
	newBalance := new(big.Int).Sub(balance, tx.Value)
	
	if token == "LYR" {
		e.state.SetBalanceLYR(from, newBalance)
	} else if token == "FLR" {
		e.state.SetBalanceFLR(from, newBalance)
	} else {
		e.state.SetBalanceToken(from, token, newBalance)
	}

	// 5. Credit Recipient
	if tx.To != nil {
		to := *tx.To
		var recipientBalance *big.Int
		
		if token == "LYR" {
			recipientBalance = e.state.GetBalanceLYR(to)
			e.state.SetBalanceLYR(to, new(big.Int).Add(recipientBalance, tx.Value))
		} else if token == "FLR" {
			recipientBalance = e.state.GetBalanceFLR(to)
			e.state.SetBalanceFLR(to, new(big.Int).Add(recipientBalance, tx.Value))
		} else {
			recipientBalance = e.state.GetBalanceToken(to, token)
			e.state.SetBalanceToken(to, token, new(big.Int).Add(recipientBalance, tx.Value))
		}
	}
	return nil
}

// executeAddLiquidity adds LYR and FLR to the pool.
// Value = AmountLYR. Data should contain AmountFLR.
// For Simplicity in this phase: Value = LYR, we assume explicit amounts for demo.
// REALITY: Decoder required.
// DEMO HACK: We assume even 50/50 split value in 'Value' is for BOTH for simplicity?? 
// No, let's parse Data if possible or just assume Value=LYR and implicit matching FLR?
// Better: Value = LYR. We deduce FLR based on Ratio or require it.
// Let's implement INITIAL LIQUIDITY logic: user provides X LYR and Y FLR.
// WE WILL USE 'Value' for LYR and Hardcode a ratio or assume equal Value in demo?
// CORRECT: We need to decode tx.Data. 
func (e *Executor) executeAddLiquidity(tx *core.Transaction, from common.Address) error {
	amountLYR := tx.Value
	amountFLR := new(big.Int).Set(tx.Value) // Default 1:1 if no data provided
	
	// Try to parse FLR amount from Data (first 32 bytes)
	if len(tx.Data) >= 32 {
		amountFLR.SetBytes(tx.Data[:32])
	}
	// Note: In a real AMM, we would require specific router calldata encoding.
	// Here we interpret raw data as the secondary token amount for simplicity in this custom L2.

	// Check Balances
	balLYR := e.state.GetBalanceLYR(from)
	balFLR := e.state.GetBalanceFLR(from)
	
	if balLYR.Cmp(amountLYR) < 0 || balFLR.Cmp(amountFLR) < 0 {
		return ErrInsufficientBalance
	}

	// Deduct User
	e.state.SetBalanceLYR(from, new(big.Int).Sub(balLYR, amountLYR))
	e.state.SetBalanceFLR(from, new(big.Int).Sub(balFLR, amountFLR))

	// Update Pool
	pool := e.state.GetPool("LYR-FLR")
	pool.Reserve0.Add(pool.Reserve0, amountLYR)
	pool.Reserve1.Add(pool.Reserve1, amountFLR)
	// Mint LP tokens here (sqrt(x*y)) - simplified to x+y for now or just x
	pool.TotalSupply.Add(pool.TotalSupply, amountLYR) 

	e.state.SetPool("LYR-FLR", pool)
	return nil
}

// executeSwap swaps LYR for FLR.
// Future improvement: Support FLR -> LYR via flag or multiple pools.
func (e *Executor) executeSwap(tx *core.Transaction, from common.Address) error {
	amountIn := tx.Value // LYR in
	
	// Check Balance
	balLYR := e.state.GetBalanceLYR(from)
	if balLYR.Cmp(amountIn) < 0 {
		return ErrInsufficientBalance
	}
	
	pool := e.state.GetPool("LYR-FLR")
	if pool.Reserve0.Cmp(big.NewInt(0)) == 0 {
		return ErrInsufficientLiquidity
	}

	// Constant Product: x * y = k
	// (x + dx)(y - dy) = k
	// dy = y - ( xy / (x + dx) )
	// dy = (y * dx) / (x + dx)
	
	// x = Reserve0 (LYR), y = Reserve1 (FLR)
	numerator := new(big.Int).Mul(pool.Reserve1, amountIn) // y * dx
	denominator := new(big.Int).Add(pool.Reserve0, amountIn) // x + dx
	amountOut := new(big.Int).Div(numerator, denominator)
	
	if amountOut.Cmp(big.NewInt(0)) == 0 {
		return ErrSlippage
	}

	// Update User
	e.state.SetBalanceLYR(from, new(big.Int).Sub(balLYR, amountIn))
	currentFLR := e.state.GetBalanceFLR(from)
	e.state.SetBalanceFLR(from, new(big.Int).Add(currentFLR, amountOut))
	
	// Update Pool
	pool.Reserve0.Add(pool.Reserve0, amountIn)
	pool.Reserve1.Sub(pool.Reserve1, amountOut)
	e.state.SetPool("LYR-FLR", pool)
	
	return nil
}

// Mint is a dev helper to add tokens to an account (Genesis/Faucet).
func (e *Executor) Mint(addr common.Address, amountLYR *big.Int, amountFLR *big.Int) {
	if amountLYR != nil {
		current := e.state.GetBalanceLYR(addr)
		e.state.SetBalanceLYR(addr, new(big.Int).Add(current, amountLYR))
	}
	if amountFLR != nil {
		current := e.state.GetBalanceFLR(addr)
		e.state.SetBalanceFLR(addr, new(big.Int).Add(current, amountFLR))
	}
}

// MintToken Mints arbitrary tokens for an account
func (e *Executor) MintToken(addr common.Address, token string, amount *big.Int) {
	if amount != nil {
		current := e.state.GetBalanceToken(addr, token)
		e.state.SetBalanceToken(addr, token, new(big.Int).Add(current, amount))
	}
}
