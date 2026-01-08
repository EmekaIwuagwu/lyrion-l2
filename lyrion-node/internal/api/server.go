package api

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	ethtypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/lyrion-l2/lyrion-node/internal/consensus"
	"github.com/lyrion-l2/lyrion-node/internal/core"
	"github.com/lyrion-l2/lyrion-node/internal/mempool"
	"github.com/lyrion-l2/lyrion-node/internal/settlement"
	"github.com/lyrion-l2/lyrion-node/internal/state"
)

type Server struct {
	state     state.StateDB
	mempool   *mempool.Mempool
	sequencer *consensus.Sequencer
	relayer   *settlement.Relayer
}

func NewServer(state state.StateDB, mp *mempool.Mempool, seq *consensus.Sequencer) *Server {
	return &Server{
		state:     state,
		mempool:   mp,
		sequencer: seq,
	}
}

// SetRelayer sets the L1 settlement relayer
func (s *Server) SetRelayer(r *settlement.Relayer) {
	s.relayer = r
}

// StartHTTP starts the JSON-RPC HTTP server.
func (s *Server) StartHTTP(port int) {
	mux := http.NewServeMux()
	
	// CORS Middleware Wrapper
	handleCORS := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Allow all origins for dev
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			
			if r.Method == "OPTIONS" {
				return
			}
			
			next(w, r)
		}
	}

	mux.HandleFunc("/", handleCORS(s.handleRPC))
	
	addr := fmt.Sprintf(":%d", port)
	log.Printf("📡 RPC Server listening on %s", addr)
	
	go func() {
		if err := http.ListenAndServe(addr, mux); err != nil {
			log.Fatalf("RPC Server failed: %v", err)
		}
	}()
}

// JSON-RPC Request/Response types
type RPCRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	Params  []interface{}   `json:"params"`
	ID      interface{}     `json:"id"`
}

type RPCResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      interface{} `json:"id"`
	Result  interface{} `json:"result,omitempty"`
	Error   *RPCError   `json:"error,omitempty"`
}

type RPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func (s *Server) handleRPC(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	
	var req RPCRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	
	res := s.executeMethod(&req)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (s *Server) executeMethod(req *RPCRequest) *RPCResponse {
	var result interface{}
	var err error
	
	switch req.Method {
	case "eth_chainId":
		result = "0xa455" // 42069
		
	case "eth_getBalance":
		result, err = s.ethGetBalance(req.Params)
		
	case "lyr_getBalances":
		result, err = s.lyrGetBalances(req.Params)
		
	case "eth_getTransactionCount":
		result, err = s.ethGetTransactionCount(req.Params)

	case "eth_estimateGas":
		result, err = s.ethEstimateGas(req.Params)

	case "eth_sendTransaction":
		result, err = s.ethSendTransaction(req.Params)

	case "eth_sendRawTransaction":
		result, err = s.ethSendRawTransaction(req.Params) // Production Ready

	case "eth_blockNumber":
		// Get real height from sequencer (minus 1 because current is next)
		h := s.sequencer.CurrentHeight()
		if h > 0 { h-- }
		result = hexutil.EncodeUint64(h)

	case "eth_getBlockByNumber":
		result, err = s.ethGetBlockByNumber(req.Params)

	case "lyr_getLatestBlocks":
		result, err = s.lyrGetLatestBlocks(req.Params)

	case "lyr_getPool":
		result, err = s.lyrGetPool(req.Params)

	case "eth_getTransactionReceipt":
		result, err = s.ethGetTransactionReceipt(req.Params)

	case "eth_getTransactionByHash":
		result, err = s.ethGetTransactionByHash(req.Params)

	case "lyr_getNetworkStats":
		result, err = s.lyrGetNetworkStats(req.Params)

	case "lyr_getTransactionsByBlock":
		result, err = s.lyrGetTransactionsByBlock(req.Params)

	case "lyr_getSettlementBatches":
		result, err = s.lyrGetSettlementBatches(req.Params)

	case "lyr_getSettlementStats":
		result, err = s.lyrGetSettlementStats(req.Params)

	case "lyr_forceSettle":
		result, err = s.lyrForceSettle(req.Params)

	case "lyr_getTransactionsByAddress":
		result, err = s.lyrGetTransactionsByAddress(req.Params)
		
	default:
		return &RPCResponse{
			JSONRPC: "2.0",
			ID:      req.ID,
			Error:   &RPCError{Code: -32601, Message: "Method not found"},
		}
	}
	
	if err != nil {
		return &RPCResponse{
			JSONRPC: "2.0",
			ID:      req.ID,
			Error:   &RPCError{Code: -32000, Message: err.Error()},
		}
	}
	
	return &RPCResponse{
		JSONRPC: "2.0",
		ID:      req.ID,
		Result:  result,
	}
}

// --- Handlers ---

func (s *Server) ethGetBalance(params []interface{}) (string, error) {
	if len(params) < 1 {
		return "", fmt.Errorf("missing address param")
	}
	addrStr, ok := params[0].(string)
	if !ok {
		return "", fmt.Errorf("invalid address param")
	}
	
	addr := common.HexToAddress(addrStr)
	bal := s.state.GetBalanceLYR(addr)
	return hexutil.EncodeBig(bal), nil
}

func (s *Server) lyrGetBalances(params []interface{}) (map[string]string, error) {
	if len(params) < 1 {
		return nil, fmt.Errorf("missing address param")
	}
	addrStr, ok := params[0].(string)
	if !ok {
		return nil, fmt.Errorf("invalid address param")
	}
	
	addr := common.HexToAddress(addrStr)
	balLyr := s.state.GetBalanceLYR(addr)
	balFlr := s.state.GetBalanceFLR(addr)
	balUsdt := s.state.GetBalanceToken(addr, "USDT")
	
	return map[string]string{
		"LYR": hexutil.EncodeBig(balLyr),
		"FLR": hexutil.EncodeBig(balFlr),
		"USDT": hexutil.EncodeBig(balUsdt),
	}, nil
}

func (s *Server) ethGetTransactionCount(params []interface{}) (string, error) {
	if len(params) < 1 {
		return "", fmt.Errorf("missing address param")
	}
	addrStr, ok := params[0].(string)
	if !ok {
		return "", fmt.Errorf("invalid address param")
	}
	
	addr := common.HexToAddress(addrStr)
	nonce := s.state.GetNonce(addr)
	return hexutil.EncodeUint64(nonce), nil
}

func (s *Server) ethEstimateGas(params []interface{}) (string, error) {
	return hexutil.EncodeUint64(50000), nil
}

func (s *Server) ethSendRawTransaction(params []interface{}) (string, error) {
	if len(params) < 1 {
		return "", fmt.Errorf("missing raw tx param")
	}
	rawTxStr, ok := params[0].(string)
	if !ok {
		return "", fmt.Errorf("invalid raw tx param")
	}
	
	rawTxBytes, err := hexutil.Decode(rawTxStr)
	if err != nil {
		return "", err
	}
	
	var ethTx ethtypes.Transaction
	if err := ethTx.UnmarshalBinary(rawTxBytes); err != nil {
		return "", fmt.Errorf("tx decode failed: %v", err)
	}
	
	signer := ethtypes.LatestSignerForChainID(big.NewInt(42069)) 
	from, err := ethtypes.Sender(signer, &ethTx)
	if err != nil {
		return "", fmt.Errorf("signature verification failed: %v", err)
	}
	
	tx := &core.Transaction{
		Type:  uint8(ethTx.Type()),
		From:  &from,
		To:    ethTx.To(),
		Value: ethTx.Value(),
		Nonce: ethTx.Nonce(),
		Gas:   ethTx.Gas(),
		GasPrice: ethTx.GasPrice(),
		Data:  ethTx.Data(),
	}
	
	if err := s.mempool.Add(tx); err != nil {
		return "", err
	}
	
	return ethTx.Hash().Hex(), nil
}

func (s *Server) ethSendTransaction(params []interface{}) (string, error) {
	if len(params) < 1 {
		return "", fmt.Errorf("missing tx params")
	}
	
	txMap, ok := params[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid tx params")
	}
	
	fromStr, _ := txMap["from"].(string)
	toStr, _ := txMap["to"].(string)
	valStr, _ := txMap["value"].(string) // hex
	
	from := common.HexToAddress(fromStr)
	to := common.HexToAddress(toStr)
	val, _ := hexutil.DecodeBig(valStr)
	if val == nil {
		val = big.NewInt(0)
	}
	
	// Parse Type (default 0)
	var typeVal uint64
	if t, ok := txMap["type"].(float64); ok {
		typeVal = uint64(t)
	} else if t, ok := txMap["type"].(string); ok {
		// handle hex parsing if sent as string "0x1"
		tv, _ := hexutil.DecodeUint64(t) 
		typeVal = tv
	}

	// Parse Data field (hex encoded)
	var data []byte
	if dataStr, ok := txMap["data"].(string); ok && len(dataStr) > 2 {
		// Decode hex (strip 0x prefix)
		decoded, err := hexutil.Decode(dataStr)
		if err == nil {
			data = decoded
		}
	}

	tx := &core.Transaction{
		Type:  uint8(typeVal),
		From:  &from,
		To:    &to,
		Value: val,
		Data:  data,
		Nonce: s.state.GetNonce(from), 
		Gas:   21000,
	}
	
	// Add to Mempool
	if err := s.mempool.Add(tx); err != nil {
		return "", err
	}
	
	// Calculate a fake hash for now (in real node, hash is computed from RLP)
	// We'll just return a random-looking hash
	return "0x" + common.Bytes2Hex(common.BigToHash(big.NewInt(int64(s.mempool.Len()))).Bytes()), nil
}

func (s *Server) ethGetBlockByNumber(params []interface{}) (interface{}, error) {
	if len(params) < 1 {
		return nil, fmt.Errorf("missing block number param")
	}
	
	// Support "latest"
	var number uint64
	if sVal, ok := params[0].(string); ok {
		if sVal == "latest" {
			current := s.sequencer.CurrentHeight()
			if current > 0 {
				number = current - 1
			} else {
				number = 0
			}
		} else {
			n, err := hexutil.DecodeUint64(sVal)
			if err != nil {
				return nil, err
			}
			number = n
		}
	}
	
	block := s.sequencer.GetBlock(number)
	if block == nil {
		return nil, nil // not found
	}

	txs := []interface{}{}
	for _, tx := range block.Transactions {
		txs = append(txs, tx.Hash().Hex())
	}
	
	extra := block.Header.Extra
	if extra == nil {
		extra = []byte{}
	}

	return map[string]interface{}{
		"number":           hexutil.EncodeUint64(block.Header.Number),
		"hash":             block.Header.Hash().Hex(),
		"parentHash":       block.Header.ParentHash.Hex(),
		"nonce":            "0x0000000000000000",
		"sha3Uncles":       "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
		"logsBloom":        "0x0000000000000000000000000000000000000000000000000000000000000000",
		"transactionsRoot": block.Header.TxRoot.Hex(),
		"stateRoot":        block.Header.Root.Hex(),
		"receiptsRoot":     block.Header.ReceiptRoot.Hex(),
		"miner":            block.Header.Coinbase.Hex(),
		"difficulty":       "0x1",
		"totalDifficulty":  "0x1",
		"extraData":        hexutil.Encode(extra),
		"size":             "0x1000",
		"gasLimit":         hexutil.EncodeUint64(block.Header.GasLimit),
		"gasUsed":          hexutil.EncodeUint64(block.Header.GasUsed),
		"timestamp":        hexutil.EncodeUint64(block.Header.Time),
		"transactions":     txs,
		"uncles":           []string{},
		"baseFeePerGas":    nil,
	}, nil
}

func (s *Server) lyrGetLatestBlocks(params []interface{}) (interface{}, error) {
	n := 10
	if len(params) > 0 {
		if f, ok := params[0].(float64); ok {
			n = int(f)
		}
	}
	return s.sequencer.GetLatestBlocks(n), nil
}

func (s *Server) lyrGetPool(params []interface{}) (interface{}, error) {
	if len(params) < 1 {
		return nil, fmt.Errorf("missing pool pair name")
	}
	pair, ok := params[0].(string)
	if !ok {
		return nil, fmt.Errorf("invalid pool pair name")
	}
	
	pool := s.state.GetPool(pair)
	return map[string]string{
		"reserve0": hexutil.EncodeBig(pool.Reserve0),
		"reserve1": hexutil.EncodeBig(pool.Reserve1),
		"totalSupply": hexutil.EncodeBig(pool.TotalSupply),
	}, nil
}

func (s *Server) ethGetTransactionReceipt(params []interface{}) (interface{}, error) {
	if len(params) < 1 {
		return nil, fmt.Errorf("missing tx hash param")
	}
	hashStr, ok := params[0].(string)
	if !ok {
		return nil, fmt.Errorf("invalid tx hash param")
	}
	
	txHash := common.HexToHash(hashStr)
	
	// Scan blocks
	height := s.sequencer.CurrentHeight()
	for i := uint64(1); i < height; i++ {
		block := s.sequencer.GetBlock(i)
		if block == nil {
			continue
		}
		for idx, tx := range block.Transactions {
			if tx.Hash() == txHash {
				// Found
				return map[string]interface{}{
					"transactionHash":   tx.Hash().Hex(),
					"transactionIndex":  hexutil.EncodeUint64(uint64(idx)),
					"blockHash":         block.Header.Hash().Hex(),
					"blockNumber":       hexutil.EncodeUint64(block.Header.Number),
					"from":              tx.From.Hex(),
					"to":                tx.To.Hex(),
					"cumulativeGasUsed": hexutil.EncodeUint64(block.Header.GasUsed), // Simplified
					"gasUsed":           hexutil.EncodeUint64(21000),
					"contractAddress":   nil,
					"logs":              []interface{}{},
					"logsBloom":         "0x0000000000000000000000000000000000000000000000000000000000000000",
					"status":            "0x1",
					"type":              hexutil.EncodeUint64(uint64(tx.Type)),
					"effectiveGasPrice": hexutil.EncodeUint64(1000000000),
				}, nil
			}
		}
	}
	return nil, nil // Not found
}

func (s *Server) ethGetTransactionByHash(params []interface{}) (interface{}, error) {
	if len(params) < 1 {
		return nil, fmt.Errorf("missing tx hash param")
	}
	hashStr, ok := params[0].(string)
	if !ok {
		return nil, fmt.Errorf("invalid tx hash param")
	}
	
	txHash := common.HexToHash(hashStr)
	
	// Search through all blocks for the transaction
	height := s.sequencer.CurrentHeight()
	for i := uint64(1); i < height; i++ {
		block := s.sequencer.GetBlock(i)
		if block == nil {
			continue
		}
		for _, tx := range block.Transactions {
			if tx.Hash() == txHash {
				// Found it!
				gasPrice := tx.GasPrice
				if gasPrice == nil {
					gasPrice = big.NewInt(1000000000) // 1 Gwei default
				}
				return map[string]interface{}{
					"hash":        tx.Hash().Hex(),
					"blockNumber": block.Header.Number,
					"blockHash":   block.Header.Hash().Hex(),
					"from":        tx.From.Hex(),
					"to":          tx.To.Hex(),
					"value":       tx.Value.String(),
					"gas":         tx.Gas,
					"gasPrice":    gasPrice.String(),
					"nonce":       tx.Nonce,
					"type":        tx.Type,
					"data":        common.Bytes2Hex(tx.Data),
					"timestamp":   block.Header.Time,
				}, nil
			}
		}
	}
	
	return nil, fmt.Errorf("transaction not found")
}

func (s *Server) lyrGetNetworkStats(params []interface{}) (interface{}, error) {
	height := s.sequencer.CurrentHeight()
	if height > 0 {
		height--
	}
	
	// Count total transactions
	totalTxs := uint64(0)
	totalGasUsed := uint64(0)
	for i := uint64(1); i <= height; i++ {
		block := s.sequencer.GetBlock(i)
		if block != nil {
			totalTxs += uint64(len(block.Transactions))
			totalGasUsed += block.Header.GasUsed
		}
	}
	
	// Get pool TVL
	pool := s.state.GetPool("LYR-FLR")
	tvl := new(big.Int).Add(pool.Reserve0, pool.Reserve1)
	
	return map[string]interface{}{
		"blockHeight":      height,
		"totalTransactions": totalTxs,
		"totalGasUsed":      totalGasUsed,
		"avgBlockTime":      3, // Hardcoded block time from config
		"activeValidators":  1, // Single sequencer for now
		"tvl":               tvl.String(),
		"chainId":           42069,
	}, nil
}

func (s *Server) lyrGetTransactionsByBlock(params []interface{}) (interface{}, error) {
	if len(params) < 1 {
		return nil, fmt.Errorf("missing block number param")
	}
	
	var blockNum uint64
	switch v := params[0].(type) {
	case float64:
		blockNum = uint64(v)
	case string:
		n, err := hexutil.DecodeUint64(v)
		if err != nil {
			return nil, err
		}
		blockNum = n
	default:
		return nil, fmt.Errorf("invalid block number param")
	}
	
	block := s.sequencer.GetBlock(blockNum)
	if block == nil {
		return nil, fmt.Errorf("block not found")
	}
	
	var txs []map[string]interface{}
	for i, tx := range block.Transactions {
		gasPrice := tx.GasPrice
		if gasPrice == nil {
			gasPrice = big.NewInt(1000000000)
		}
		txs = append(txs, map[string]interface{}{
			"index":     i,
			"hash":      tx.Hash().Hex(),
			"from":      tx.From.Hex(),
			"to":        tx.To.Hex(),
			"value":     tx.Value.String(),
			"gas":       tx.Gas,
			"gasPrice":  gasPrice.String(),
			"nonce":     tx.Nonce,
			"type":      tx.Type,
		})
	}
	
	return txs, nil
}

// Settlement RPC handlers

func (s *Server) lyrGetSettlementBatches(params []interface{}) (interface{}, error) {
	if s.relayer == nil {
		return nil, fmt.Errorf("settlement relayer not configured")
	}
	
	batches := s.relayer.GetBatches()
	return batches, nil
}

func (s *Server) lyrGetSettlementStats(params []interface{}) (interface{}, error) {
	if s.relayer == nil {
		return nil, fmt.Errorf("settlement relayer not configured")
	}
	
	stats := s.relayer.GetStats()
	return stats, nil
}

func (s *Server) lyrForceSettle(params []interface{}) (interface{}, error) {
	if s.relayer == nil {
		return nil, fmt.Errorf("settlement relayer not configured")
	}
	
	batch, err := s.relayer.ForceSettle()
	if err != nil {
		return nil, err
	}
	
	return batch, nil
}

func (s *Server) lyrGetTransactionsByAddress(params []interface{}) (interface{}, error) {
	if len(params) < 1 {
		return nil, fmt.Errorf("missing address param")
	}
	addrStr, ok := params[0].(string)
	if !ok {
		return nil, fmt.Errorf("invalid address param")
	}
	
	targetAddr := common.HexToAddress(addrStr)
	
	var txList []map[string]interface{}
	
	height := s.sequencer.CurrentHeight()
	for i := uint64(1); i < height; i++ {
		block := s.sequencer.GetBlock(i)
		if block == nil {
			continue
		}
		
		for _, tx := range block.Transactions {
			// Check if tx involves the target address
			isFrom := tx.From != nil && *tx.From == targetAddr
			isTo := tx.To != nil && *tx.To == targetAddr
			
			if isFrom || isTo {
				txType := "transfer"
				if tx.Type == 1 {
					txType = "swap"
				} else if tx.Type == 2 {
					txType = "add_liquidity"
				} else if tx.Type == 3 {
					txType = "remove_liquidity"
				}
				
				direction := "send"
				if isTo && !isFrom {
					direction = "receive"
				}
				if tx.Type == 1 {
					direction = "swap"
				}
				
				// Token symbol from data field
				symbol := "LYR"
				if len(tx.Data) > 0 {
					symbol = string(tx.Data)
				}
				
				fromAddr := ""
				if tx.From != nil {
					fromAddr = tx.From.Hex()
				}
				toAddr := ""
				if tx.To != nil {
					toAddr = tx.To.Hex()
				}
				
				txList = append(txList, map[string]interface{}{
					"hash":        tx.Hash().Hex(),
					"type":        txType,
					"direction":   direction,
					"from":        fromAddr,
					"to":          toAddr,
					"value":       tx.Value.String(),
					"symbol":      symbol,
					"blockNumber": block.Header.Number,
					"timestamp":   block.Header.Time,
					"status":      "success",
				})
			}
		}
	}
	
	// Reverse to show newest first
	for i, j := 0, len(txList)-1; i < j; i, j = i+1, j-1 {
		txList[i], txList[j] = txList[j], txList[i]
	}
	
	return txList, nil
}

