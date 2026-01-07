"use client";

import { useState, useEffect } from "react";
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { rpcCall } from "@/lib/api";
import { formatEther } from "ethers";

export default function AnalyticsPage() {
    const [pool, setPool] = useState({ reserve0: "0", reserve1: "0", totalSupply: "0" });
    const [stats, setStats] = useState({ blockHeight: 0, totalTransactions: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const poolData = await rpcCall<any>("lyr_getPool", ["LYR-FLR"]);
                setPool({
                    reserve0: formatEther(poolData.reserve0),
                    reserve1: formatEther(poolData.reserve1),
                    totalSupply: formatEther(poolData.totalSupply),
                });

                const networkStats = await rpcCall<any>("lyr_getNetworkStats", []);
                setStats({
                    blockHeight: networkStats.blockHeight || 0,
                    totalTransactions: networkStats.totalTransactions || 0,
                });
            } catch (e) {
                console.error("Failed to fetch analytics", e);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const tvl = parseFloat(pool.reserve0) * 2.5 + parseFloat(pool.reserve1) * 0.04;
    const volume24h = 45230; // Mock
    const fees24h = volume24h * 0.003;

    return (
        <div className="min-h-screen p-4 md:p-8 relative font-sans">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
                    <p className="text-gray-400">Protocol metrics and performance</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="dex-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <CurrencyDollarIcon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Value Locked</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">${tvl.toLocaleString()}</p>
                        <p className="text-sm text-green-400 mt-2">+12.5% (7d)</p>
                    </div>

                    <div className="dex-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                <ChartBarIcon className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volume (24h)</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">${volume24h.toLocaleString()}</p>
                        <p className="text-sm text-green-400 mt-2">+8.3% (24h)</p>
                    </div>

                    <div className="dex-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fees (24h)</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">${fees24h.toLocaleString()}</p>
                        <p className="text-sm text-gray-400 mt-2">0.3% fee tier</p>
                    </div>

                    <div className="dex-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Transactions</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalTransactions.toLocaleString()}</p>
                        <p className="text-sm text-gray-400 mt-2">Block #{stats.blockHeight}</p>
                    </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="dex-card p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">TVL Over Time</h2>
                        <div className="h-64 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
                            <div className="text-center">
                                <span className="text-6xl mb-4 block">📈</span>
                                <p className="text-gray-400">Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>

                    <div className="dex-card p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Volume Over Time</h2>
                        <div className="h-64 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
                            <div className="text-center">
                                <span className="text-6xl mb-4 block">📊</span>
                                <p className="text-gray-400">Chart visualization coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pool Distribution */}
                <div className="dex-card p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Pool Distribution</h2>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">LYR Reserve</span>
                                <span className="text-white font-bold">{parseFloat(pool.reserve0).toLocaleString()} LYR</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600" style={{ width: "50%" }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400">FLR Reserve</span>
                                <span className="text-white font-bold">{parseFloat(pool.reserve1).toLocaleString()} FLR</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: "50%" }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Protocol Revenue */}
                <div className="dex-card p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Protocol Revenue</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Today</p>
                            <p className="text-2xl font-bold text-white">${(fees24h * 0.5).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <p className="text-sm text-gray-400 mb-2">This Week</p>
                            <p className="text-2xl font-bold text-white">${(fees24h * 7 * 0.5).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <p className="text-sm text-gray-400 mb-2">All Time</p>
                            <p className="text-2xl font-bold text-white">${(fees24h * 30 * 0.5).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
