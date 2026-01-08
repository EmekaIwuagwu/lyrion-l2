package config

import (
	"fmt"
	"os"
)

type Config struct {
	// Node Identity
	NetworkID uint64
	
	// Paths
	DataDir string
	
	// Networking
	HTTPHost string
	HTTPPort int
	WSHost   string
	WSPort   int
	
	// Consensus / Sequencer
	IsSequencer       bool
	SequencerPrivKey  string // Hex string, should be loaded from secure secret store in prod
	
	// L1 Interaction (Flare)
	FlareRPC          string
	BatchSubmitterPri string // Private key for submitting batches to L1
}

// DefaultConfig returns a standard configuration for local dev
func DefaultConfig() *Config {
	home, _ := os.UserHomeDir()
	
	dataDir := os.Getenv("LYRION_DATA_DIR")
	if dataDir == "" {
		dataDir = fmt.Sprintf("%s/.lyrion/data", home)
	}

	// L1 Settlement Configuration
	flareRPC := os.Getenv("LYRION_L1_RPC")
	if flareRPC == "" {
		flareRPC = "https://coston2-api.flare.network/ext/C/rpc" // Flare Coston2 Testnet
	}
	
	l1PrivKey := os.Getenv("LYRION_L1_PRIVATE_KEY") // Set this to enable real L1 settlement

	return &Config{
		NetworkID:         42069, // LYRION Testnet
		DataDir:           dataDir,
		HTTPHost:          "127.0.0.1",
		HTTPPort:          8545,
		WSHost:            "127.0.0.1",
		WSPort:            8546,
		IsSequencer:       true,
		FlareRPC:          flareRPC,
		BatchSubmitterPri: l1PrivKey,
	}
}
