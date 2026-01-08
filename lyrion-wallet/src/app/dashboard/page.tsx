"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import {
    RefreshCw,
    Copy,
    Check,
    ArrowUpRight,
    ArrowDownLeft
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const router = useRouter();
    const { address, assets, refreshBalances, isUnlocked } = useWallet();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isUnlocked) {
            router.push("/login");
        }
    }, [isUnlocked, router]);

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isUnlocked) return null;

    // Calculate total (demo prices: LYR/FLR = $0.10, USDT = $1)
    const DEMO_PRICES: Record<string, number> = { LYR: 0.10, FLR: 0.05, USDT: 1.00 };
    const totalBalance = assets.reduce((acc, curr) => acc + (parseFloat(curr.balance) * (DEMO_PRICES[curr.symbol] || 0)), 0).toFixed(2);

    return (
        <div className="space-y-8 pb-24 pt-4">

            {/* Portfolio Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div
                            onClick={copyAddress}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/10 cursor-pointer hover:bg-black/40 transition-colors group"
                        >
                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></div>
                            <span className="font-mono text-xs text-gray-300 group-hover:text-white transition-colors">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
                        </div>

                        <button onClick={() => refreshBalances()} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <RefreshCw className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <p className="text-gray-400 text-sm font-medium tracking-wide mb-1">Total Balance</p>
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400 tracking-tight">
                        ${totalBalance}
                    </h1>
                    <p className="text-cyan-400/70 text-xs font-medium mt-2 flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">Testnet</span>
                    </p>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/dashboard/send")}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-5 flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 border border-white/10"
                >
                    <div className="p-2 bg-white/20 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-white">Send</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/dashboard/receive")}
                    className="group relative overflow-hidden rounded-2xl bg-[#1e1e2e]/80 border border-white/10 p-5 flex items-center justify-center gap-3 hover:bg-[#1e1e2e] transition-colors"
                >
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-white/20">
                        <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="font-bold text-lg text-gray-200 group-hover:text-white">Receive</span>
                </motion.button>
            </div>

            {/* Asset List */}
            <div>
                <h2 className="text-lg font-bold text-white mb-4 pl-1">Your Assets</h2>
                <div className="space-y-3">
                    {assets.map((asset, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={asset.symbol}
                            className="glass-panel rounded-2xl p-4 flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer border-transparent hover:border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${asset.color} flex items-center justify-center text-white font-bold shadow-lg text-xl`}>
                                    {asset.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{asset.name}</h3>
                                    <p className="text-sm text-gray-500 font-mono">{asset.balance} {asset.symbol}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-bold text-white text-lg">${(parseFloat(asset.balance) * (DEMO_PRICES[asset.symbol] || 0)).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">@ ${DEMO_PRICES[asset.symbol]?.toFixed(2)}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    );
}
