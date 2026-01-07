package node

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/p2p/discovery/mdns"
	drouting "github.com/libp2p/go-libp2p/p2p/discovery/routing"
	"github.com/lyrion-l2/lyrion-node/internal/core"
)

const (
	// P2P Protocol IDs
	ProtocolID      = "/lyrion/1.0.0"
	BlockTopic      = "/lyrion/blocks"
	TxTopic         = "/lyrion/txs"
	DiscoveryTag    = "lyrion-p2p"
	
	// Timeouts
	DiscoveryInterval = 10 * time.Second
)

// P2PNode represents a LYRION P2P network node
type P2PNode struct {
	host           host.Host
	dht            *dht.IpfsDHT
	pubsub         *pubsub.PubSub
	blockTopic     *pubsub.Topic
	txTopic        *pubsub.Topic
	blockSub       *pubsub.Subscription
	txSub          *pubsub.Subscription
	
	// Callbacks for received data
	onBlock        func(*core.Block)
	onTransaction  func(*core.Transaction)
	
	// Peer tracking
	peers          map[peer.ID]bool
	peersMu        sync.RWMutex
	
	ctx            context.Context
	cancel         context.CancelFunc
}

// BlockMessage represents a block broadcast over P2P
type BlockMessage struct {
	Block     *core.Block `json:"block"`
	Sender    string      `json:"sender"`
	Timestamp int64       `json:"timestamp"`
}

// TxMessage represents a transaction broadcast over P2P
type TxMessage struct {
	Tx        *core.Transaction `json:"tx"`
	Sender    string            `json:"sender"`
	Timestamp int64             `json:"timestamp"`
}

// Config for P2P node
type P2PConfig struct {
	ListenPort     int
	BootstrapPeers []string
	EnableMDNS     bool // Local network discovery
}

// NewP2PNode creates a new P2P network node
func NewP2PNode(cfg *P2PConfig) (*P2PNode, error) {
	ctx, cancel := context.WithCancel(context.Background())
	
	// Create libp2p host
	opts := []libp2p.Option{
		libp2p.ListenAddrStrings(
			fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", cfg.ListenPort),
			fmt.Sprintf("/ip4/0.0.0.0/udp/%d/quic-v1", cfg.ListenPort),
		),
		libp2p.EnableNATService(),
		libp2p.EnableRelay(),
	}
	
	h, err := libp2p.New(opts...)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("failed to create host: %w", err)
	}
	
	log.Printf("🌐 P2P Node started with ID: %s", h.ID().String())
	for _, addr := range h.Addrs() {
		log.Printf("   Listening on: %s/p2p/%s", addr.String(), h.ID().String())
	}
	
	// Create DHT for peer discovery
	kdht, err := dht.New(ctx, h, dht.Mode(dht.ModeServer))
	if err != nil {
		h.Close()
		cancel()
		return nil, fmt.Errorf("failed to create DHT: %w", err)
	}
	
	// Bootstrap the DHT
	if err := kdht.Bootstrap(ctx); err != nil {
		h.Close()
		cancel()
		return nil, fmt.Errorf("failed to bootstrap DHT: %w", err)
	}
	
	// Create pubsub for message propagation
	ps, err := pubsub.NewGossipSub(ctx, h)
	if err != nil {
		h.Close()
		cancel()
		return nil, fmt.Errorf("failed to create pubsub: %w", err)
	}
	
	// Join topics
	blockTopic, err := ps.Join(BlockTopic)
	if err != nil {
		h.Close()
		cancel()
		return nil, fmt.Errorf("failed to join block topic: %w", err)
	}
	
	txTopic, err := ps.Join(TxTopic)
	if err != nil {
		h.Close()
		cancel()
		return nil, fmt.Errorf("failed to join tx topic: %w", err)
	}
	
	// Subscribe to topics
	blockSub, err := blockTopic.Subscribe()
	if err != nil {
		h.Close()
		cancel()
		return nil, fmt.Errorf("failed to subscribe to blocks: %w", err)
	}
	
	txSub, err := txTopic.Subscribe()
	if err != nil {
		h.Close()
		cancel()
		return nil, fmt.Errorf("failed to subscribe to txs: %w", err)
	}
	
	node := &P2PNode{
		host:       h,
		dht:        kdht,
		pubsub:     ps,
		blockTopic: blockTopic,
		txTopic:    txTopic,
		blockSub:   blockSub,
		txSub:      txSub,
		peers:      make(map[peer.ID]bool),
		ctx:        ctx,
		cancel:     cancel,
	}
	
	// Connect to bootstrap peers
	for _, peerAddr := range cfg.BootstrapPeers {
		if err := node.connectToPeer(peerAddr); err != nil {
			log.Printf("⚠️ Failed to connect to bootstrap peer %s: %v", peerAddr, err)
		}
	}
	
	// Enable mDNS for local discovery
	if cfg.EnableMDNS {
		node.setupMDNS()
	}
	
	// Start discovery routine
	go node.discoverPeers()
	
	return node, nil
}

// SetBlockHandler sets the callback for received blocks
func (n *P2PNode) SetBlockHandler(handler func(*core.Block)) {
	n.onBlock = handler
}

// SetTxHandler sets the callback for received transactions
func (n *P2PNode) SetTxHandler(handler func(*core.Transaction)) {
	n.onTransaction = handler
}

// Start begins listening for messages
func (n *P2PNode) Start() {
	go n.handleBlocks()
	go n.handleTransactions()
	log.Printf("📡 P2P message handlers started")
}

// BroadcastBlock broadcasts a new block to the network
func (n *P2PNode) BroadcastBlock(block *core.Block) error {
	msg := BlockMessage{
		Block:     block,
		Sender:    n.host.ID().String(),
		Timestamp: time.Now().Unix(),
	}
	
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal block: %w", err)
	}
	
	if err := n.blockTopic.Publish(n.ctx, data); err != nil {
		return fmt.Errorf("failed to publish block: %w", err)
	}
	
	log.Printf("📤 Broadcasted Block #%d to %d peers", block.Header.Number, n.PeerCount())
	return nil
}

// BroadcastTransaction broadcasts a transaction to the network
func (n *P2PNode) BroadcastTransaction(tx *core.Transaction) error {
	msg := TxMessage{
		Tx:        tx,
		Sender:    n.host.ID().String(),
		Timestamp: time.Now().Unix(),
	}
	
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal tx: %w", err)
	}
	
	if err := n.txTopic.Publish(n.ctx, data); err != nil {
		return fmt.Errorf("failed to publish tx: %w", err)
	}
	
	return nil
}

// handleBlocks processes incoming block messages
func (n *P2PNode) handleBlocks() {
	for {
		msg, err := n.blockSub.Next(n.ctx)
		if err != nil {
			if n.ctx.Err() != nil {
				return // Context cancelled
			}
			log.Printf("Error receiving block: %v", err)
			continue
		}
		
		// Skip messages from ourselves
		if msg.ReceivedFrom == n.host.ID() {
			continue
		}
		
		var blockMsg BlockMessage
		if err := json.Unmarshal(msg.Data, &blockMsg); err != nil {
			log.Printf("Failed to unmarshal block message: %v", err)
			continue
		}
		
		log.Printf("📥 Received Block #%d from %s", blockMsg.Block.Header.Number, msg.ReceivedFrom.String()[:16])
		
		if n.onBlock != nil {
			n.onBlock(blockMsg.Block)
		}
	}
}

// handleTransactions processes incoming transaction messages
func (n *P2PNode) handleTransactions() {
	for {
		msg, err := n.txSub.Next(n.ctx)
		if err != nil {
			if n.ctx.Err() != nil {
				return
			}
			log.Printf("Error receiving tx: %v", err)
			continue
		}
		
		if msg.ReceivedFrom == n.host.ID() {
			continue
		}
		
		var txMsg TxMessage
		if err := json.Unmarshal(msg.Data, &txMsg); err != nil {
			log.Printf("Failed to unmarshal tx message: %v", err)
			continue
		}
		
		if n.onTransaction != nil {
			n.onTransaction(txMsg.Tx)
		}
	}
}

// connectToPeer connects to a peer by multiaddress string
func (n *P2PNode) connectToPeer(addrStr string) error {
	addr, err := peer.AddrInfoFromString(addrStr)
	if err != nil {
		return fmt.Errorf("invalid peer address: %w", err)
	}
	
	if err := n.host.Connect(n.ctx, *addr); err != nil {
		return fmt.Errorf("failed to connect: %w", err)
	}
	
	n.peersMu.Lock()
	n.peers[addr.ID] = true
	n.peersMu.Unlock()
	
	log.Printf("✅ Connected to peer: %s", addr.ID.String()[:16])
	return nil
}

// discoverPeers continuously discovers new peers
func (n *P2PNode) discoverPeers() {
	routingDiscovery := drouting.NewRoutingDiscovery(n.dht)
	
	ticker := time.NewTicker(DiscoveryInterval)
	defer ticker.Stop()
	
	for {
		select {
		case <-n.ctx.Done():
			return
		case <-ticker.C:
			// Advertise ourselves
			_, err := routingDiscovery.Advertise(n.ctx, DiscoveryTag)
			if err != nil {
				continue
			}
			
			// Find peers
			peerChan, err := routingDiscovery.FindPeers(n.ctx, DiscoveryTag)
			if err != nil {
				continue
			}
			
			for p := range peerChan {
				if p.ID == n.host.ID() {
					continue
				}
				
				n.peersMu.RLock()
				_, exists := n.peers[p.ID]
				n.peersMu.RUnlock()
				
				if !exists {
					if err := n.host.Connect(n.ctx, p); err == nil {
						n.peersMu.Lock()
						n.peers[p.ID] = true
						n.peersMu.Unlock()
						log.Printf("🔗 Discovered and connected to peer: %s", p.ID.String()[:16])
					}
				}
			}
		}
	}
}

// setupMDNS sets up local network discovery
func (n *P2PNode) setupMDNS() {
	s := mdns.NewMdnsService(n.host, DiscoveryTag, &mdnsNotifee{node: n})
	if err := s.Start(); err != nil {
		log.Printf("⚠️ mDNS setup failed: %v", err)
	} else {
		log.Printf("🔍 mDNS discovery enabled")
	}
}

// mdnsNotifee handles mDNS peer discovery
type mdnsNotifee struct {
	node *P2PNode
}

func (m *mdnsNotifee) HandlePeerFound(pi peer.AddrInfo) {
	if pi.ID == m.node.host.ID() {
		return
	}
	
	m.node.peersMu.RLock()
	_, exists := m.node.peers[pi.ID]
	m.node.peersMu.RUnlock()
	
	if !exists {
		if err := m.node.host.Connect(m.node.ctx, pi); err == nil {
			m.node.peersMu.Lock()
			m.node.peers[pi.ID] = true
			m.node.peersMu.Unlock()
			log.Printf("🔗 mDNS: Connected to local peer: %s", pi.ID.String()[:16])
		}
	}
}

// PeerCount returns the number of connected peers
func (n *P2PNode) PeerCount() int {
	n.peersMu.RLock()
	defer n.peersMu.RUnlock()
	return len(n.peers)
}

// GetPeers returns the list of connected peer IDs
func (n *P2PNode) GetPeers() []string {
	n.peersMu.RLock()
	defer n.peersMu.RUnlock()
	
	peers := make([]string, 0, len(n.peers))
	for p := range n.peers {
		peers = append(peers, p.String())
	}
	return peers
}

// ID returns the node's peer ID
func (n *P2PNode) ID() string {
	return n.host.ID().String()
}

// Addrs returns the node's listening addresses
func (n *P2PNode) Addrs() []string {
	addrs := make([]string, 0)
	for _, addr := range n.host.Addrs() {
		addrs = append(addrs, fmt.Sprintf("%s/p2p/%s", addr.String(), n.host.ID().String()))
	}
	return addrs
}

// Close shuts down the P2P node
func (n *P2PNode) Close() error {
	n.cancel()
	n.blockSub.Cancel()
	n.txSub.Cancel()
	return n.host.Close()
}
