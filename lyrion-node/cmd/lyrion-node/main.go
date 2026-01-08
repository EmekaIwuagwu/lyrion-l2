package main

import (
	"fmt"
	"log"
	"math/big"
	"os"
	"os/signal"
	"syscall"
	"time"
	
	"github.com/ethereum/go-ethereum/common"
	"github.com/lyrion-l2/lyrion-node/internal/api"
	"github.com/lyrion-l2/lyrion-node/internal/config"
	"github.com/lyrion-l2/lyrion-node/internal/consensus"
	"github.com/lyrion-l2/lyrion-node/internal/core"
	"github.com/lyrion-l2/lyrion-node/internal/execution"
	"github.com/lyrion-l2/lyrion-node/internal/mempool"
	"github.com/lyrion-l2/lyrion-node/internal/node"
	"github.com/lyrion-l2/lyrion-node/internal/settlement"
	"github.com/lyrion-l2/lyrion-node/internal/state"
)

func main() {
	cfg := config.DefaultConfig()
	
	fmt.Println("🚀 Starting LYRION L2 Node...")
	fmt.Printf("🌌 Network ID: %d\n", cfg.NetworkID)
	
	stateDB, err := state.NewBadgerStateDB(cfg.DataDir)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer stateDB.Close()
	
	executor := execution.NewExecutor(stateDB)
	mp := mempool.NewMempool()
	
	// Sequencer (Miner)
	sequencerAddr := common.HexToAddress("0x9999999999999999999999999999999999999999")
	seq := consensus.NewSequencer(stateDB, mp, executor, sequencerAddr)
	
	// 2. Genesis State & AMM Setup
	// Alice (Foundry Default Account #0)
	// Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
	alice := common.HexToAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
	pool := stateDB.GetPool("LYR-FLR")
	
	// If pool is empty, bootstrap it
	if pool.TotalSupply.Cmp(big.NewInt(0)) == 0 {
		fmt.Println("🌱 Bootstrapping Genesis State & Liquidity Pool...")
		
		// 1 ETH = 10^18 Wei
		oneEth := new(big.Int).SetInt64(1000000000000000000)
		amount := new(big.Int).Mul(big.NewInt(1000000), oneEth) // 1M Tokens (10^24)
		
		// Use Alice as the initial liquidity provider
		executor.Mint(alice, amount, amount) // LYR + FLR
		executor.MintToken(alice, "USDT", amount) // USDT (1M) 
		
		// Create TX to add liquidity: 500k LYR & 500k FLR
		liquidityAmount := new(big.Int).Mul(big.NewInt(500000), oneEth)
		
		tx := &core.Transaction{
			Type:  core.TxTypeAddLiquidity,
			From:  &alice,
			Value: liquidityAmount, 
			Nonce: stateDB.GetNonce(alice),
			Gas:   50000,
		}
		
		// Force direct execution for genesis (bypass mempool for setup)
		err := executor.ExecuteTransaction(tx, alice)
		if err != nil {
			log.Fatalf("Genesis Liquidity Failed: %v", err)
		}
		fmt.Println("💧 Initial Liquidity Added: 500k LYR / 500k FLR")
	}
	
	// 3. Start P2P Node
	p2pCfg := &node.P2PConfig{
		ListenPort: 9000,
		EnableMDNS: true,
	}
	
	p2pNode, err := node.NewP2PNode(p2pCfg)
	if err != nil {
		log.Printf("⚠️ Failed to start P2P node: %v", err)
	} else {
		p2pNode.Start()
		
		// Handle incoming transactions
		p2pNode.SetTxHandler(func(tx *core.Transaction) {
			if err := mp.Add(tx); err == nil {
				log.Printf("📥 P2P: Received new tx from %s", tx.From.Hex())
			}
		})
		
		// Handle incoming blocks (Logging only for Sequencer)
		p2pNode.SetBlockHandler(func(block *core.Block) {
			log.Printf("📥 P2P: Received Block #%d with %d txs", block.Header.Number, len(block.Transactions))
		})
	}

	// 4. Start API Server
	rpcServer := api.NewServer(stateDB, mp, seq)
	rpcServer.StartHTTP(cfg.HTTPPort)
	
	// 5. Start L1 Settlement Relayer
	l1PrivKey := cfg.BatchSubmitterPri
	if l1PrivKey == "" {
		l1PrivKey = "demo" // Fallback to demo mode if no private key configured
	}
	relayer, err := settlement.NewRelayer(cfg.FlareRPC, seq, l1PrivKey, 2) // Settle every 2 blocks
	if err != nil {
		log.Printf("⚠️ Failed to create relayer: %v (continuing without L1 settlement)", err)
	} else {
		relayer.Start()
		rpcServer.SetRelayer(relayer)
	}
	
	// 6. Block Production Loop
	fmt.Println("⏳ Starting Block Production Loop (3s)...")
	ticker := time.NewTicker(3 * time.Second)
	done := make(chan bool)
	
	go func() {
		for {
			select {
			case <-ticker.C:
				if mp.Len() > 0 {
					block, err := seq.ProduceBlock()
					if err != nil {
						log.Printf("❌ Mining Error: %v", err)
					} else {
						log.Printf("📦 Mined Block #%d with %d txs", block.Header.Number, len(block.Transactions))
						
						// Broadcast block to P2P network
						if p2pNode != nil {
							go p2pNode.BroadcastBlock(block)
						}
					}
				}
			case <-done:
				ticker.Stop()
				return
			}
		}
	}()
	
	// 7. Handle Shutdown
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	
	<-sigs
	fmt.Println("\n🛑 Shutting down LYRION Node...")
	if p2pNode != nil {
		p2pNode.Close()
	}
	done <- true
}
