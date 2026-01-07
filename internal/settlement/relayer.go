package settlement

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log"
	"math/big"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/lyrion-l2/lyrion-node/internal/consensus"
)

// Batch represents a collection of L2 blocks to be settled on L1
type Batch struct {
	BatchNumber    uint64         `json:"batchNumber"`
	StartBlock     uint64         `json:"startBlock"`
	EndBlock       uint64         `json:"endBlock"`
	StateRoot      common.Hash    `json:"stateRoot"`
	TxCount        uint64         `json:"txCount"`
	Timestamp      uint64         `json:"timestamp"`
	SettledTxHash  string         `json:"settledTxHash,omitempty"`
	SettledOnL1    bool           `json:"settledOnL1"`
	L1BlockNumber  uint64         `json:"l1BlockNumber,omitempty"`
}

// Relayer handles L1 settlement
type Relayer struct {
	flareRPC       string
	client         *ethclient.Client
	sequencer      *consensus.Sequencer
	privateKey     *ecdsa.PrivateKey
	address        common.Address
	chainID        *big.Int
	
	// Batch tracking
	batches        []*Batch
	lastSettled    uint64
	batchInterval  int // Blocks between settlements
	mu             sync.RWMutex
	
	// L1 Contract address (in production, this would be a real contract)
	l1ContractAddr common.Address
	
	// Demo mode - don't actually send L1 transactions
	demoMode       bool
}

// NewRelayer creates a new L1 relayer
func NewRelayer(flareRPC string, sequencer *consensus.Sequencer, privateKeyHex string, batchInterval int) (*Relayer, error) {
	r := &Relayer{
		flareRPC:       flareRPC,
		sequencer:      sequencer,
		batches:        make([]*Batch, 0),
		lastSettled:    0,
		batchInterval:  batchInterval,
		l1ContractAddr: common.HexToAddress("0x0000000000000000000000000000000000000000"), // Placeholder
		demoMode:       true, // Enable demo mode by default (no real L1 transactions)
	}
	
	// Parse private key if provided
	if privateKeyHex != "" && privateKeyHex != "demo" {
		pk, err := crypto.HexToECDSA(privateKeyHex)
		if err != nil {
			return nil, fmt.Errorf("invalid private key: %v", err)
		}
		r.privateKey = pk
		r.address = crypto.PubkeyToAddress(pk.PublicKey)
		r.demoMode = false
	} else {
		// Demo mode with placeholder address
		r.address = common.HexToAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
		r.demoMode = true
	}
	
	// Try to connect to Flare L1
	if !r.demoMode {
		client, err := ethclient.Dial(flareRPC)
		if err != nil {
			log.Printf("⚠️ Could not connect to Flare L1 at %s: %v (running in demo mode)", flareRPC, err)
			r.demoMode = true
		} else {
			r.client = client
			chainID, err := client.ChainID(context.Background())
			if err != nil {
				log.Printf("⚠️ Could not get Flare chain ID: %v (running in demo mode)", err)
				r.demoMode = true
			} else {
				r.chainID = chainID
				log.Printf("🌐 Connected to Flare L1 (Chain ID: %s)", chainID.String())
			}
		}
	}
	
	return r, nil
}

// Start begins the settlement loop
func (r *Relayer) Start() {
	log.Printf("🔗 L1 Settlement Relayer started (Batch interval: %d blocks, Demo: %v)", r.batchInterval, r.demoMode)
	
	go func() {
		ticker := time.NewTicker(10 * time.Second) // Check every 10 seconds
		defer ticker.Stop()
		
		for range ticker.C {
			r.checkAndSettle()
		}
	}()
}

// checkAndSettle checks if we have enough blocks to create a new batch
func (r *Relayer) checkAndSettle() {
	currentHeight := r.sequencer.CurrentHeight() - 1 // Current height is "next block to mine"
	
	// Check if we have enough new blocks
	if currentHeight <= r.lastSettled || currentHeight-r.lastSettled < uint64(r.batchInterval) {
		return
	}
	
	// Create batch
	startBlock := r.lastSettled + 1
	endBlock := currentHeight
	
	batch, err := r.createBatch(startBlock, endBlock)
	if err != nil {
		log.Printf("⚠️ Failed to create batch: %v", err)
		return
	}
	
	// Settle on L1
	err = r.settleOnL1(batch)
	if err != nil {
		log.Printf("⚠️ Failed to settle on L1: %v", err)
		return
	}
	
	r.mu.Lock()
	r.batches = append(r.batches, batch)
	r.lastSettled = endBlock
	r.mu.Unlock()
	
	log.Printf("✅ Settled Batch #%d on L1 (Blocks %d-%d, %d txs, Root: %s...)",
		batch.BatchNumber, batch.StartBlock, batch.EndBlock, batch.TxCount,
		batch.StateRoot.Hex()[:14])
}

// createBatch creates a batch from a range of L2 blocks
func (r *Relayer) createBatch(start, end uint64) (*Batch, error) {
	var lastStateRoot common.Hash
	var txCount uint64
	
	for i := start; i <= end; i++ {
		block := r.sequencer.GetBlock(i)
		if block != nil {
			lastStateRoot = block.Header.Root
			txCount += uint64(len(block.Transactions))
		}
	}
	
	r.mu.RLock()
	batchNum := uint64(len(r.batches) + 1)
	r.mu.RUnlock()
	
	return &Batch{
		BatchNumber: batchNum,
		StartBlock:  start,
		EndBlock:    end,
		StateRoot:   lastStateRoot,
		TxCount:     txCount,
		Timestamp:   uint64(time.Now().Unix()),
	}, nil
}

// settleOnL1 submits the batch to Flare L1
func (r *Relayer) settleOnL1(batch *Batch) error {
	if r.demoMode {
		// Demo mode - simulate L1 settlement
		batch.SettledOnL1 = true
		batch.L1BlockNumber = uint64(time.Now().Unix()) % 1000000 // Fake L1 block number
		batch.SettledTxHash = fmt.Sprintf("0x%x", crypto.Keccak256([]byte(fmt.Sprintf("%d%d%s", 
			batch.BatchNumber, batch.Timestamp, batch.StateRoot.Hex()))))[:66]
		
		log.Printf("📡 [DEMO] Simulated L1 settlement - TxHash: %s", batch.SettledTxHash[:18]+"...")
		return nil
	}
	
	// Real L1 settlement
	if r.client == nil {
		return fmt.Errorf("no L1 client connected")
	}
	
	// In production, this would call a smart contract on Flare
	// For now, we'll send a simple transaction with the state root as data
	ctx := context.Background()
	
	nonce, err := r.client.PendingNonceAt(ctx, r.address)
	if err != nil {
		return fmt.Errorf("failed to get nonce: %v", err)
	}
	
	gasPrice, err := r.client.SuggestGasPrice(ctx)
	if err != nil {
		return fmt.Errorf("failed to get gas price: %v", err)
	}
	
	// Construct settlement data
	data := append(batch.StateRoot.Bytes(), 
		big.NewInt(int64(batch.StartBlock)).Bytes()...)
	data = append(data, big.NewInt(int64(batch.EndBlock)).Bytes()...)
	
	tx := types.NewTransaction(
		nonce,
		r.l1ContractAddr,
		big.NewInt(0),
		100000,
		gasPrice,
		data,
	)
	
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(r.chainID), r.privateKey)
	if err != nil {
		return fmt.Errorf("failed to sign tx: %v", err)
	}
	
	err = r.client.SendTransaction(ctx, signedTx)
	if err != nil {
		return fmt.Errorf("failed to send tx: %v", err)
	}
	
	batch.SettledTxHash = signedTx.Hash().Hex()
	batch.SettledOnL1 = true
	
	log.Printf("📡 Submitted to Flare L1 - TxHash: %s", batch.SettledTxHash)
	
	return nil
}

// GetBatches returns all batches
func (r *Relayer) GetBatches() []*Batch {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	result := make([]*Batch, len(r.batches))
	copy(result, r.batches)
	return result
}

// GetLatestBatch returns the most recent batch
func (r *Relayer) GetLatestBatch() *Batch {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	if len(r.batches) == 0 {
		return nil
	}
	return r.batches[len(r.batches)-1]
}

// ForceSettle immediately creates and submits a batch
func (r *Relayer) ForceSettle() (*Batch, error) {
	currentHeight := r.sequencer.CurrentHeight() - 1
	
	if currentHeight <= r.lastSettled {
		return nil, fmt.Errorf("no new blocks to settle")
	}
	
	startBlock := r.lastSettled + 1
	endBlock := currentHeight
	
	batch, err := r.createBatch(startBlock, endBlock)
	if err != nil {
		return nil, err
	}
	
	err = r.settleOnL1(batch)
	if err != nil {
		return nil, err
	}
	
	r.mu.Lock()
	r.batches = append(r.batches, batch)
	r.lastSettled = endBlock
	r.mu.Unlock()
	
	return batch, nil
}

// GetStats returns settlement statistics
func (r *Relayer) GetStats() map[string]interface{} {
	r.mu.RLock()
	defer r.mu.RUnlock()
	
	var totalTxs uint64
	for _, b := range r.batches {
		totalTxs += b.TxCount
	}
	
	return map[string]interface{}{
		"totalBatches":     len(r.batches),
		"lastSettledBlock": r.lastSettled,
		"totalTxsSettled":  totalTxs,
		"demoMode":         r.demoMode,
		"flareRPC":         r.flareRPC,
		"relayerAddress":   r.address.Hex(),
	}
}
