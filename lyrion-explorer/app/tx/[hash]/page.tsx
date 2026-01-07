"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { rpcCall } from "@/lib/api";
import Link from "next/link";

interface TxData {
    hash: string;
    blockNumber: number;
    blockHash: string;
    from: string;
    to: string;
    value: string;
    gas: number;
    gasPrice: string;
    nonce: number;
    type: number;
    data: string;
    timestamp: number;
}

const DetailRow = ({ label, value, type = "text", link }: any) => (
    <div className="flex flex-col md:flex-row md:items-start justify-between py-5 border-b border-white/5 hover:bg-white/5 transition-colors px-6 group">
        <div className="text-gray-400 font-heading text-xs uppercase tracking-wider mb-2 md:mb-0 w-48 pt-1 group-hover:text-pink-400 transition-colors">
            {label}
        </div>
        <div className={`flex-1 font-mono text-sm break-all ${type === 'link' ? 'text-pink-400 hover:text-pink-300 underline decoration-dotted cursor-pointer' : 'text-gray-200'}`}>
            {link ? <Link href={link}>{value}</Link> : value}
        </div>
    </div>
);

export default function TxDetail({ params }: { params: Promise<{ hash: string }> }) {
    const resolvedParams = React.use(params);
    const [tx, setTx] = useState<TxData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentHeight, setCurrentHeight] = useState(0);

    const txHash = resolvedParams.hash;

    useEffect(() => {
        const fetchTx = async () => {
            try {
                setLoading(true);

                // Get current height for confirmations
                const heightHex = await rpcCall<string>("eth_blockNumber", []);
                const height = parseInt(heightHex, 16);
                setCurrentHeight(height);

                // Fetch transaction by hash
                const txData = await rpcCall<TxData>("eth_getTransactionByHash", [txHash]);

                if (!txData) {
                    setError("Transaction not found");
                    setLoading(false);
                    return;
                }

                setTx(txData);
                setLoading(false);
            } catch (e: any) {
                console.error(e);
                setError(e.message || "Failed to fetch transaction");
                setLoading(false);
            }
        };

        fetchTx();
    }, [txHash]);

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

    const getTxTypeName = (type: number) => {
        switch (type) {
            case 0: return "Transfer";
            case 1: return "Swap";
            case 2: return "Add Liquidity";
            case 3: return "Remove Liquidity";
            default: return "Unknown";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
                <Sidebar />
                <main className="flex-1 ml-72 p-8 flex items-center justify-center">
                    <div className="text-pink-400 text-xl animate-pulse">Loading Transaction...</div>
                </main>
            </div>
        );
    }

    if (error || !tx) {
        return (
            <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
                <Sidebar />
                <main className="flex-1 ml-72 p-8 flex items-center justify-center">
                    <div className="text-red-400 text-xl">{error || "Transaction not found"}</div>
                </main>
            </div>
        );
    }

    const confirmations = tx ? currentHeight - tx.blockNumber + 1 : 0;
    const valueEth = Number(tx.value) / 1e18;
    const gasPriceGwei = Number(tx.gasPrice) / 1e9;
    const txFee = (tx.gas * gasPriceGwei) / 1e9; // Gas * GasPrice in LYR

    return (
        <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
            <Sidebar />
            <main className="flex-1 ml-72 p-8 relative">
                {/* Ambient Bg */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                            <div className="bg-[#0B0E1D] p-3 rounded-[10px]">
                                <div className="text-2xl">🧾</div>
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="text-3xl font-heading font-bold text-white tracking-wide">
                                Transaction Details
                            </h1>
                            <div className="font-mono text-xs text-gray-400 mt-1 truncate max-w-2xl">{tx.hash}</div>
                        </div>
                    </div>

                    {/* Main Data Card */}
                    <div className="cosmic-card overflow-hidden backdrop-blur-3xl bg-[#151A2C]/90 border-pink-500/20">
                        {/* Status Bar */}
                        <div className="bg-gradient-to-r from-green-500/20 to-transparent p-4 border-b border-white/5 flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_10px_#22c55e]">
                                <svg className="w-3 h-3 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className="font-heading font-bold text-green-400 tracking-wide uppercase">Success</span>
                            <span className="text-xs text-gray-500 font-mono ml-auto">
                                {confirmations} confirmation{confirmations !== 1 ? 's' : ''} • {timeAgo(tx.timestamp)}
                            </span>
                        </div>

                        <div className="p-0">
                            <DetailRow label="Transaction Hash" value={tx.hash} />
                            <DetailRow
                                label="Block"
                                value={`#${tx.blockNumber}`}
                                type="link"
                                link={`/block/${tx.blockNumber}`}
                            />
                            <DetailRow label="Timestamp" value={formatTimestamp(tx.timestamp)} />
                            <DetailRow
                                label="From"
                                value={tx.from}
                                type="link"
                            />
                            <DetailRow
                                label="To"
                                value={tx.to}
                                type="link"
                            />

                            {/* Transaction Type Badge */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between py-5 border-b border-white/5 px-6">
                                <div className="text-gray-400 font-heading text-xs uppercase tracking-wider mb-2 md:mb-0 w-48 pt-1">
                                    Transaction Type
                                </div>
                                <div className="flex-1">
                                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${tx.type === 1 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                        tx.type === 2 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                            tx.type === 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                'bg-green-500/20 text-green-400 border border-green-500/30'
                                        }`}>
                                        {getTxTypeName(tx.type)}
                                    </span>
                                </div>
                            </div>

                            {/* Value Highlight */}
                            <div className="py-6 px-6 border-b border-white/5 bg-white/5 flex items-center gap-4">
                                <div className="text-gray-400 font-heading text-xs uppercase tracking-wider w-48">Value Transfer</div>
                                <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                                    💎 {valueEth.toFixed(4)} <span className="text-sm font-sans font-normal text-gray-400 self-end mb-1">LYR</span>
                                </div>
                            </div>

                            <DetailRow label="Transaction Fee" value={`${txFee.toFixed(6)} LYR`} />
                            <DetailRow label="Gas Price" value={`${gasPriceGwei.toFixed(2)} Gwei`} />
                            <DetailRow label="Gas Limit & Usage" value={`${tx.gas.toLocaleString()} | ${tx.gas.toLocaleString()} (100%)`} />
                            <DetailRow label="Nonce" value={tx.nonce.toString()} />
                        </div>
                    </div>

                    {/* Input Data / Logs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="cosmic-card p-6 min-h-[200px]">
                            <h3 className="text-gray-400 font-heading text-xs uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Input Data</h3>
                            <div className="font-mono text-xs text-gray-500 bg-black/30 p-4 rounded-lg break-all h-32 overflow-auto custom-scrollbar">
                                {tx.data && tx.data.length > 0 ? `0x${tx.data}` : `0x (Tx Type: ${tx.type} - ${getTxTypeName(tx.type)})`}
                            </div>
                        </div>
                        <div className="cosmic-card p-6 min-h-[200px]">
                            <h3 className="text-gray-400 font-heading text-xs uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Transaction Receipt</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status:</span>
                                    <span className="text-green-400 font-mono">Success (1)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Block Hash:</span>
                                    <span className="text-gray-300 font-mono text-xs">{tx.blockHash.slice(0, 20)}...</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Gas Used:</span>
                                    <span className="text-gray-300 font-mono">{tx.gas.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Cumulative Gas:</span>
                                    <span className="text-gray-300 font-mono">{tx.gas.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <Footer />
            </main>
        </div>
    );
}
