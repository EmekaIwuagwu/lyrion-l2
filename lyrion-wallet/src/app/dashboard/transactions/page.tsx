"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import {
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCcw,
    Search,
    ExternalLink,
    Loader2,
    X,
    Copy,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";

type Transaction = {
    hash: string;
    type: string;
    direction: string;
    from: string;
    to: string;
    value: string;
    symbol: string;
    blockNumber: number;
    timestamp: number;
    status: string;
};

const FILTERS = ["All", "Send", "Receive", "Swap"];

export default function TransactionsPage() {
    const router = useRouter();
    const { address, isUnlocked, rpcUrl } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [error, setError] = useState("");
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [copied, setCopied] = useState("");

    useEffect(() => {
        if (!isUnlocked) {
            router.push("/login");
        }
    }, [isUnlocked, router]);

    const fetchTransactions = async () => {
        if (!address) return;
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "lyr_getTransactionsByAddress",
                    params: [address],
                    id: 1
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            setTransactions(data.result || []);
        } catch (e: any) {
            console.error("Failed to fetch transactions:", e);
            setError(e.message || "Failed to load transactions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (address) fetchTransactions();
    }, [address]);

    const filteredTxs = transactions.filter(tx => {
        if (activeFilter === "All") return true;
        return tx.direction.toLowerCase() === activeFilter.toLowerCase();
    });

    const formatValue = (value: string, symbol: string) => {
        try {
            const formatted = parseFloat(ethers.formatEther(value)).toFixed(4);
            return `${formatted} ${symbol}`;
        } catch {
            return `${value} ${symbol}`;
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const formatFullTime = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(""), 2000);
    };

    const getIcon = (direction: string) => {
        switch (direction) {
            case "receive": return <ArrowDownLeft className="w-4 h-4" />;
            case "send": return <ArrowUpRight className="w-4 h-4" />;
            case "swap": return <RefreshCcw className="w-4 h-4" />;
            default: return <ArrowUpRight className="w-4 h-4" />;
        }
    };

    const getColor = (direction: string) => {
        switch (direction) {
            case "receive": return "text-green-400 bg-green-500/20";
            case "send": return "text-orange-400 bg-orange-500/20";
            case "swap": return "text-purple-400 bg-purple-500/20";
            default: return "text-gray-400 bg-gray-500/20";
        }
    };

    if (!isUnlocked) return null;

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    History
                </h1>
                <button
                    onClick={fetchTransactions}
                    disabled={isLoading}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
                >
                    <RefreshCcw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                {FILTERS.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p>Loading transactions...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredTxs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500 glass-panel rounded-2xl">
                    <Search className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-medium">No transactions found</p>
                    <p className="text-sm opacity-70">Your transaction history will appear here</p>
                </div>
            )}

            {/* Transaction List */}
            {!isLoading && filteredTxs.length > 0 && (
                <div className="space-y-3">
                    {filteredTxs.map((tx, index) => (
                        <motion.div
                            key={tx.hash}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedTx(tx)}
                            className="glass-panel rounded-2xl p-4 flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getColor(tx.direction)}`}>
                                    {getIcon(tx.direction)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white capitalize">{tx.direction}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{formatTime(tx.timestamp)}</span>
                                        <span>•</span>
                                        <span className="text-green-400">{tx.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right flex items-center gap-3">
                                <div>
                                    <p className={`font-bold ${tx.direction === 'receive' ? 'text-green-400' : 'text-white'}`}>
                                        {tx.direction === 'receive' ? '+' : '-'}{formatValue(tx.value, tx.symbol)}
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {tx.hash.slice(0, 10)}...
                                    </p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Transaction Detail Modal */}
            <AnimatePresence>
                {selectedTx && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedTx(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md glass-card rounded-3xl p-6 relative overflow-hidden"
                        >
                            {/* Decorative glow */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${selectedTx.direction === 'receive'
                                    ? 'bg-gradient-to-r from-transparent via-green-500 to-transparent'
                                    : 'bg-gradient-to-r from-transparent via-purple-500 to-transparent'
                                }`}></div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedTx(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getColor(selectedTx.direction)}`}>
                                    {getIcon(selectedTx.direction)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white capitalize">{selectedTx.direction}</h2>
                                    <p className="text-sm text-gray-400">{formatFullTime(selectedTx.timestamp)}</p>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="text-center py-6 mb-6 bg-white/5 rounded-2xl">
                                <p className={`text-3xl font-bold ${selectedTx.direction === 'receive' ? 'text-green-400' : 'text-white'}`}>
                                    {selectedTx.direction === 'receive' ? '+' : '-'}{formatValue(selectedTx.value, selectedTx.symbol)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${selectedTx.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {selectedTx.status}
                                    </span>
                                </p>
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                                <DetailRow
                                    label="Transaction Hash"
                                    value={selectedTx.hash}
                                    copyable
                                    copied={copied === "hash"}
                                    onCopy={() => copyToClipboard(selectedTx.hash, "hash")}
                                />
                                <DetailRow
                                    label="From"
                                    value={selectedTx.from}
                                    copyable
                                    copied={copied === "from"}
                                    onCopy={() => copyToClipboard(selectedTx.from, "from")}
                                />
                                <DetailRow
                                    label="To"
                                    value={selectedTx.to}
                                    copyable
                                    copied={copied === "to"}
                                    onCopy={() => copyToClipboard(selectedTx.to, "to")}
                                />
                                <DetailRow label="Block" value={`#${selectedTx.blockNumber}`} />
                                <DetailRow label="Type" value={selectedTx.type} />
                            </div>

                            {/* View in Explorer */}
                            <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-gray-300 flex items-center justify-center gap-2 transition-colors border border-white/5">
                                <ExternalLink className="w-4 h-4" />
                                View in Explorer
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper component for detail rows
function DetailRow({ label, value, copyable, copied, onCopy }: {
    label: string;
    value: string;
    copyable?: boolean;
    copied?: boolean;
    onCopy?: () => void;
}) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-sm text-gray-400">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-sm text-white font-mono truncate max-w-[180px]">
                    {value.length > 20 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value}
                </span>
                {copyable && onCopy && (
                    <button onClick={onCopy} className="p-1 hover:bg-white/10 rounded transition-colors">
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
                    </button>
                )}
            </div>
        </div>
    );
}
