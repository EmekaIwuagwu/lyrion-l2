"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, MinusIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { rpcCall } from "@/lib/api";
import { ethers, formatEther } from "ethers";

const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC_URL = "http://localhost:8545";

export default function LiquidityPage() {
    const router = useRouter();
    const [pool, setPool] = useState({ reserve0: "0", reserve1: "0", totalSupply: "0" });
    const [userBalance, setUserBalance] = useState({ LYR: "0", FLR: "0" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const provider = new ethers.JsonRpcProvider(RPC_URL);
                const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

                // Get pool data
                const poolData = await rpcCall<any>("lyr_getPool", ["LYR-FLR"]);
                setPool({
                    reserve0: formatEther(poolData.reserve0),
                    reserve1: formatEther(poolData.reserve1),
                    totalSupply: formatEther(poolData.totalSupply),
                });

                // Get user balances
                const bals = await rpcCall<any>("lyr_getBalances", [wallet.address]);
                if (bals) {
                    setUserBalance({
                        LYR: parseFloat(formatEther(bals.LYR)).toFixed(2),
                        FLR: parseFloat(formatEther(bals.FLR)).toFixed(2),
                    });
                }
            } catch (e) {
                console.error("Failed to fetch liquidity data", e);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const apr = 12.5; // Mock APR

    return (
        <div className="min-h-screen p-4 md:p-8 relative font-sans">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Liquidity Pools</h1>
                        <p className="text-gray-400">Provide liquidity and earn trading fees</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push("/liquidity/add")}
                            className="btn-hyper px-6 py-3 flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add Liquidity
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="dex-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <ChartBarIcon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Value Locked</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">${(parseFloat(pool.reserve0) * 2.5 + parseFloat(pool.reserve1) * 0.04).toLocaleString()}</p>
                        <p className="text-sm text-green-400 mt-2">+5.2% (24h)</p>
                    </div>

                    <div className="dex-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                <span className="text-2xl">💧</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Your Liquidity</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">$0.00</p>
                        <p className="text-sm text-gray-400 mt-2">0 LP Tokens</p>
                    </div>

                    <div className="dex-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-2xl">📈</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Est. APR</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{apr}%</p>
                        <p className="text-sm text-gray-400 mt-2">Based on 24h fees</p>
                    </div>
                </div>

                {/* Active Pools */}
                <div className="dex-card p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Active Pools</h2>

                    <div className="space-y-4">
                        {/* LYR-FLR Pool */}
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-slate-900"></div>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-slate-900"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">LYR / FLR</h3>
                                        <p className="text-sm text-gray-400">Primary Trading Pair</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-8 text-center">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">TVL</p>
                                        <p className="text-lg font-bold text-white">${(parseFloat(pool.reserve0) * 2.5 + parseFloat(pool.reserve1) * 0.04).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Volume (24h)</p>
                                        <p className="text-lg font-bold text-white">$45,230</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">APR</p>
                                        <p className="text-lg font-bold text-green-400">{apr}%</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => router.push("/liquidity/add")}
                                        className="px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 font-bold transition-all border border-indigo-500/30"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => router.push("/liquidity/remove")}
                                        className="px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 font-bold transition-all border border-pink-500/30"
                                    >
                                        <MinusIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Pool Details */}
                            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">LYR Reserve:</span>
                                    <span className="text-white font-mono">{parseFloat(pool.reserve0).toLocaleString()} LYR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">FLR Reserve:</span>
                                    <span className="text-white font-mono">{parseFloat(pool.reserve1).toLocaleString()} FLR</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Your Positions */}
                <div className="dex-card p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Your Positions</h2>

                    <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">💧</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Liquidity Positions</h3>
                        <p className="text-gray-400 mb-6">Start earning fees by providing liquidity</p>
                        <button
                            onClick={() => router.push("/liquidity/add")}
                            className="btn-hyper px-8 py-3"
                        >
                            Add Liquidity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
