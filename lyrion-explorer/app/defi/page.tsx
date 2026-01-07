"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

const PoolCard = ({ pair, tvl, vol, apy }: any) => (
    <div className="cosmic-card p-6 border-l-4 border-l-purple-500 hover:border-l-cyan-400 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 border border-black z-10"></div>
                    <div className="w-8 h-8 rounded-full bg-cyan-600 border border-black"></div>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight group-hover:text-cyan-400 transition-colors">{pair}</h3>
                    <p className="text-xs text-gray-500">v3 Automated</p>
                </div>
            </div>
            <div className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/20">
                {apy}% APY
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">TVL</p>
                <p className="font-mono text-white text-lg">${tvl}</p>
            </div>
            <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">24h Vol</p>
                <p className="font-mono text-gray-300 text-lg">${vol}</p>
            </div>
        </div>
    </div>
);

export default function DefiPage() {
    return (
        <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
            <Sidebar />
            <main className="flex-1 ml-72 p-8 relative">
                <div className="absolute top-0 center w-full h-[400px] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-white tracking-wide">DeFi Analytics</h1>
                            <p className="text-gray-400 text-sm mt-2">Liquidity, Yields, and Galaxy-wide Volume</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-gray-500 text-xs uppercase">Total Value Locked</p>
                                <p className="text-2xl font-mono font-bold text-white">$89,240,192</p>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="text-right">
                                <p className="text-gray-500 text-xs uppercase">24h Volume</p>
                                <p className="text-2xl font-mono font-bold text-cyan-400">$12,401,921</p>
                            </div>
                        </div>
                    </div>

                    {/* Chart Area Mock */}
                    <div className="cosmic-card h-[300px] mb-12 p-6 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5"></div>
                        <div className="flex justify-between z-10">
                            <h3 className="font-heading font-bold text-gray-300">TVL Growth</h3>
                            <div className="flex gap-2">
                                <button className="text-xs bg-white/10 px-3 py-1 rounded text-white active">1W</button>
                                <button className="text-xs hover:bg-white/5 px-3 py-1 rounded text-gray-500">1M</button>
                                <button className="text-xs hover:bg-white/5 px-3 py-1 rounded text-gray-500">YTD</button>
                            </div>
                        </div>

                        {/* Visual Fake Chart */}
                        <div className="flex items-end h-[200px] gap-2 mt-4 z-10">
                            {[40, 45, 30, 60, 55, 70, 85, 80, 95, 100, 90, 85, 70, 75, 80, 95, 100, 110, 105, 115, 120, 125, 130, 140].map((h, i) => (
                                <div key={i} style={{ height: `${h / 1.5}%` }} className="flex-1 bg-gradient-to-t from-purple-600/50 to-cyan-400/80 rounded-t-sm hover:opacity-80 transition-opacity"></div>
                            ))}
                        </div>
                    </div>

                    {/* Pools Grid */}
                    <h2 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
                        Popular Pools <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">v3</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <PoolCard pair="LYR - FLR" tvl="45.2M" vol="1.2M" apy="14.2" />
                        <PoolCard pair="LYR - USDC" tvl="22.1M" vol="4.5M" apy="8.5" />
                        <PoolCard pair="WETH - LYR" tvl="12.4M" vol="890K" apy="22.1" />
                        <PoolCard pair="FLR - USDT" tvl="5.2M" vol="2.1M" apy="11.4" />
                        <PoolCard pair="WBTC - LYR" tvl="8.9M" vol="120K" apy="34.2" />
                        <PoolCard pair="DAI - USDC" tvl="1.2M" vol="44K" apy="2.1" />
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}
