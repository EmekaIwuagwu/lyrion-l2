"use client";

import { useState } from "react";
import { ArrowUpRightIcon, ArrowDownLeftIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

export default function ActivityPage() {
    const [filter, setFilter] = useState<"all" | "swaps" | "liquidity">("all");

    // Mock transaction data
    const transactions = [
        {
            id: "0x1a2b3c...",
            type: "swap",
            from: "LYR",
            to: "FLR",
            amount: "100",
            received: "99.5",
            timestamp: "2 minutes ago",
            status: "completed",
        },
        {
            id: "0x4d5e6f...",
            type: "add_liquidity",
            from: "LYR",
            to: "FLR",
            amount: "500",
            received: "500",
            timestamp: "1 hour ago",
            status: "completed",
        },
        {
            id: "0x7g8h9i...",
            type: "swap",
            from: "FLR",
            to: "LYR",
            amount: "50",
            received: "50.2",
            timestamp: "3 hours ago",
            status: "completed",
        },
    ];

    const filteredTxs = transactions.filter(tx => {
        if (filter === "all") return true;
        if (filter === "swaps") return tx.type === "swap";
        if (filter === "liquidity") return tx.type === "add_liquidity" || tx.type === "remove_liquidity";
        return true;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case "swap":
                return <ArrowUpRightIcon className="w-5 h-5" />;
            case "add_liquidity":
                return <PlusIcon className="w-5 h-5" />;
            case "remove_liquidity":
                return <MinusIcon className="w-5 h-5" />;
            default:
                return <ArrowUpRightIcon className="w-5 h-5" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "swap":
                return "Swap";
            case "add_liquidity":
                return "Add Liquidity";
            case "remove_liquidity":
                return "Remove Liquidity";
            default:
                return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "swap":
                return "from-indigo-500 to-purple-600";
            case "add_liquidity":
                return "from-emerald-500 to-teal-600";
            case "remove_liquidity":
                return "from-pink-500 to-rose-600";
            default:
                return "from-gray-500 to-gray-600";
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 relative font-sans">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Activity</h1>
                        <p className="text-gray-400">Your transaction history</p>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10">
                        Export CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${filter === "all"
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("swaps")}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${filter === "swaps"
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        Swaps
                    </button>
                    <button
                        onClick={() => setFilter("liquidity")}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${filter === "liquidity"
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        Liquidity
                    </button>
                </div>

                {/* Transactions List */}
                <div className="dex-card p-8">
                    <div className="space-y-4">
                        {filteredTxs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">📜</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No Transactions</h3>
                                <p className="text-gray-400">Your transaction history will appear here</p>
                            </div>
                        ) : (
                            filteredTxs.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(tx.type)} flex items-center justify-center text-white`}>
                                                {getIcon(tx.type)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{getTypeLabel(tx.type)}</h3>
                                                <p className="text-sm text-gray-400">{tx.timestamp}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-bold">{tx.amount} {tx.from}</span>
                                                <ArrowUpRightIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-white font-bold">{tx.received} {tx.to}</span>
                                            </div>
                                            <a
                                                href={`http://localhost:3001/tx/${tx.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                                            >
                                                {tx.id}
                                            </a>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                            <span className="text-sm text-green-400 font-bold capitalize">{tx.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
