"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { rpcCall } from "@/lib/api";
import Link from "next/link";

interface BlockData {
    number: number;
    hash: string;
    parentHash: string;
    timestamp: number;
    coinbase: string;
    gasUsed: number;
    gasLimit: number;
    txCount: number;
    stateRoot: string;
}

interface TxData {
    hash: string;
    from: string;
    to: string;
    value: string;
    type: number;
    gas: number;
    gasPrice: string;
    nonce: number;
}

const DataRow = ({ label, value, type = "text", link }: any) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-white/5 hover:bg-white/5 transition-colors px-6 group">
        <div className="text-gray-400 font-heading text-xs uppercase tracking-wider mb-1 md:mb-0 group-hover:text-cyan-400 transition-colors">
            {label}
        </div>
        <div className={`font-mono text-sm break-all ${type === 'link' ? 'text-cyan-400 hover:text-cyan-300 underline decoration-dotted cursor-pointer' : 'text-gray-200'}`}>
            {link ? <Link href={link}>{value}</Link> : value}
        </div>
    </div>
);

export default function BlockDetail({ params }: { params: Promise<{ number: string }> }) {
    const resolvedParams = React.use(params);
    const [block, setBlock] = useState<BlockData | null>(null);
    const [transactions, setTransactions] = useState<TxData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentHeight, setCurrentHeight] = useState(0);

    const blockNum = resolvedParams.number;

    useEffect(() => {
        const fetchBlock = async () => {
            try {
                setLoading(true);

                // Get current height for confirmations
                const heightHex = await rpcCall<string>("eth_blockNumber", []);
                const height = parseInt(heightHex, 16);
                setCurrentHeight(height);

                // Parse block number from URL (handle both decimal and hex)
                let parsedBlockNum = 0;
                if (blockNum.startsWith("0x")) {
                    parsedBlockNum = parseInt(blockNum, 16);
                } else {
                    parsedBlockNum = parseInt(blockNum, 10);
                }

                // Fetch block data
                const blockData = await rpcCall<any>("eth_getBlockByNumber", [`0x${parsedBlockNum.toString(16)}`]);

                if (!blockData) {
                    setError("Block not found");
                    setLoading(false);
                    return;
                }

                const header = blockData.Header || blockData;

                setBlock({
                    number: header.number,
                    hash: header.parentHash ? header.parentHash.slice(0, 18) + "..." : "0x0000...",
                    parentHash: header.parentHash || "0x0000000000000000000000000000000000000000000000000000000000000000",
                    timestamp: header.timestamp,
                    coinbase: header.coinbase || "0x9999999999999999999999999999999999999999",
                    gasUsed: header.gasUsed || 0,
                    gasLimit: header.gasLimit || 30000000, // Default L2 limit
                    txCount: blockData.Transactions ? blockData.Transactions.length : 0,
                    stateRoot: header.stateRoot || "0x0000...",
                });

                // Fetch transactions for this block
                try {
                    const txs = await rpcCall<TxData[]>("lyr_getTransactionsByBlock", [parseInt(blockNum)]);
                    setTransactions(txs || []);
                } catch (e) {
                    console.warn("Failed to fetch transactions for block", e);
                }

                setLoading(false);
            } catch (e: any) {
                console.error(e);
                setError(e.message || "Failed to fetch block");
                setLoading(false);
            }
        };

        fetchBlock();
    }, [blockNum]);

    const formatTimestamp = (ts: number) => {
        const date = new Date(ts * 1000);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
    };

    const timeAgo = (ts: number) => {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - ts;
        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    };

    const confirmations = block ? currentHeight - block.number + 1 : 0;
    const gasPercentage = block ? ((block.gasUsed / (block.gasLimit || 30000000)) * 100).toFixed(1) : "0";
    const gasDashOffset = 552 - (552 * (parseFloat(gasPercentage) / 100));

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
                <Sidebar />
                <main className="flex-1 ml-72 p-8 flex items-center justify-center">
                    <div className="text-cyan-400 text-xl animate-pulse">Loading Block #{blockNum}...</div>
                </main>
            </div>
        );
    }

    if (error || !block) {
        return (
            <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
                <Sidebar />
                <main className="flex-1 ml-72 p-8 flex items-center justify-center">
                    <div className="text-red-400 text-xl">{error || "Block not found"}</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
            <Sidebar />
            <main className="flex-1 ml-72 p-8 relative overflow-hidden">
                {/* Ambient Bg */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                            <div className="text-2xl">📦</div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-white tracking-wide">
                                Block <span className="text-cyan-400">#{block.number}</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
                                    {confirmations >= 1 ? "Finalized" : "Pending"}
                                </span>
                                <span>•</span>
                                <span>{timeAgo(block.timestamp)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Crystal Card */}
                    <div className="cosmic-card overflow-hidden backdrop-blur-3xl bg-[#151A2C]/80 border-cyan-500/20">
                        {/* Progress Bar Decoration */}
                        <div className="h-1 w-full bg-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"
                                style={{ width: `${gasPercentage}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3">
                            {/* Left Panel - Key Metrics */}
                            <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-white/5">
                                <DataRow label="Block Height" value={block.number.toLocaleString()} />
                                <DataRow
                                    label="Status"
                                    value={`Confirmed (${confirmations} confirmation${confirmations !== 1 ? 's' : ''})`}
                                />
                                <DataRow label="Timestamp" value={formatTimestamp(block.timestamp)} />
                                <DataRow
                                    label="Transactions"
                                    value={`${block.txCount} txn${block.txCount !== 1 ? 's' : ''} in this block`}
                                    type="link"
                                />
                                <DataRow
                                    label="Proposed By"
                                    value={`${block.coinbase.slice(0, 8)}...${block.coinbase.slice(-6)} (Sequencer)`}
                                    type="link"
                                />
                                <DataRow label="Block Reward" value="0 LYR (L2 - No block rewards)" />
                                <DataRow label="Gas Used" value={`${block.gasUsed.toLocaleString()} (${gasPercentage}%)`} />
                                <DataRow label="Gas Limit" value={block.gasLimit.toLocaleString()} />
                                <DataRow label="State Root" value={block.stateRoot.slice(0, 20) + "..."} />
                            </div>

                            {/* Right Panel - Gas/Viz */}
                            <div className="p-6 bg-black/20">
                                <h3 className="font-heading text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Gas Analytics</h3>

                                <div className="relative w-48 h-48 mx-auto mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="96" cy="96" r="88" strokeWidth="12" stroke="#1e293b" fill="none" />
                                        <circle
                                            cx="96" cy="96" r="88"
                                            strokeWidth="12"
                                            stroke="#06b6d4"
                                            fill="none"
                                            strokeDasharray="552"
                                            strokeDashoffset={gasDashOffset}
                                            strokeLinecap="round"
                                            className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                                        />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                        <div className="text-3xl font-mono font-bold text-white">{gasPercentage}%</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Gas Used</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <div className="text-xs text-gray-400 mb-1">Base Fee</div>
                                        <div className="font-mono text-cyan-300">1.0 Gwei</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <div className="text-xs text-gray-400 mb-1">Block Gas</div>
                                        <div className="font-mono text-orange-400">🔥 {(block.gasUsed / 1e9).toFixed(6)} ETH equiv</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transactions List */}
                    {transactions.length > 0 && (
                        <>
                            <h3 className="text-white font-heading font-bold text-lg mt-12 mb-4 flex items-center gap-2">
                                <span className="text-pink-500">❖</span> Transactions in Block
                            </h3>
                            <div className="cosmic-card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5 border-b border-white/10">
                                            <tr>
                                                <th className="text-left p-4 text-xs text-gray-400 uppercase">Hash</th>
                                                <th className="text-left p-4 text-xs text-gray-400 uppercase">Type</th>
                                                <th className="text-left p-4 text-xs text-gray-400 uppercase">From</th>
                                                <th className="text-left p-4 text-xs text-gray-400 uppercase">To</th>
                                                <th className="text-right p-4 text-xs text-gray-400 uppercase">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((tx, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="p-4">
                                                        <Link href={`/tx/${tx.hash}`} className="text-pink-400 hover:text-pink-300 font-mono text-sm">
                                                            {tx.hash.slice(0, 14)}...
                                                        </Link>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`text-xs px-2 py-1 rounded ${tx.type === 1 ? 'bg-purple-500/20 text-purple-400' :
                                                            tx.type === 2 ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-green-500/20 text-green-400'
                                                            }`}>
                                                            {tx.type === 1 ? 'Swap' : tx.type === 2 ? 'AddLiquidity' : 'Transfer'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-mono text-sm text-cyan-400">{tx.from.slice(0, 10)}...</td>
                                                    <td className="p-4 font-mono text-sm text-cyan-400">{tx.to.slice(0, 10)}...</td>
                                                    <td className="p-4 text-right font-mono text-sm text-white">
                                                        {(Number(tx.value) / 1e18).toFixed(4)} LYR
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    <h3 className="text-white font-heading font-bold text-lg mt-12 mb-4 flex items-center gap-2">
                        <span className="text-pink-500">❖</span> Block Data
                    </h3>
                    <div className="cosmic-card p-4 bg-black/40 font-mono text-xs text-gray-500 break-all leading-relaxed">
                        Parent Hash: {block.parentHash}
                    </div>

                </div>
                <Footer />
            </main>
        </div>
    );
}
