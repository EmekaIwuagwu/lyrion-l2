"use client";

import React, { useState } from "react";
import Link from "next/link";

// Mock Assets
const assets = [
    { symbol: "LYR", name: "Lyrion", amount: "10,450.00", price: 1.24, value: "12,958.00", change: 2.4, icon: "🌌" },
    { symbol: "WFLR", name: "Wrapped Flare", amount: "1,200.00", price: 0.03, value: "36.00", change: -1.2, icon: "🔥" },
    { symbol: "USDC", name: "USD Coin", amount: "450.00", price: 1.00, value: "450.00", change: 0.0, icon: "💵" },
];

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("assets");

    return (
        <div className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden font-sans">

            {/* Dynamic Background */}
            <div className="absolute top-0 center w-full h-[600px] bg-gradient-to-b from-purple-900/10 via-cyan-900/5 to-transparent pointer-events-none"></div>

            {/* Header */}
            <header className="w-full max-w-5xl flex justify-between items-center mb-10 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xl">🌌</span>
                    </div>
                    <span className="text-xl font-bold tracking-widest text-white" style={{ fontFamily: '"Exo 2"' }}>LYRION</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-black/40 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                        <span className="text-xs font-mono text-gray-300">Mainnet • v1.2</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">
                        ⚙️
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 z-10">

                {/* LEFT COLUMN: Portfolio & Assets */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Master Balance Card */}
                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full -mr-20 -mt-20 blur-[80px] pointer-events-none group-hover:bg-purple-600/30 transition-all duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">Total Portfolio Value</p>
                                <div className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded uppercase border border-green-500/20">+2.4% (24H)</div>
                            </div>

                            <h1 className="text-5xl font-mono font-bold text-white mb-8 text-shadow-glow tracking-tighter">
                                $13,444.00
                            </h1>

                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/dashboard/send">
                                    <button className="btn-gorgeous w-full py-3.5 rounded-xl font-bold text-white uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                        <span>↗</span> Send
                                    </button>
                                </Link>
                                <Link href="/dashboard/receive">
                                    <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-3.5 rounded-xl font-bold text-white uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2">
                                        <span>↙</span> Receive
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 2. Asset List */}
                    <div className="glass-panel rounded-3xl overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <h3 className="font-bold text-gray-200 uppercase tracking-widest text-xs">Your Assets</h3>
                            <button className="text-xs text-cyan-400 hover:text-cyan-300 font-bold tracking-wide transition-colors">+ Import Token</button>
                        </div>

                        <div className="divide-y divide-white/5">
                            {assets.map((asset) => (
                                <div key={asset.symbol} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-xl shadow-inner group-hover:scale-110 transition-transform">
                                            {asset.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{asset.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                {asset.amount} <span className="text-gray-600">{asset.symbol}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-white tracking-tight">${asset.value}</div>
                                        <div className={`text-xs font-bold ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {asset.change > 0 ? '+' : ''}{asset.change}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Activity Feed */}
                <div className="glass-panel rounded-3xl h-full flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-black/20">
                        <h3 className="font-bold text-white uppercase tracking-widest text-xs">Activity Feed</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {/* Mock Transaction Item */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-white bg-gray-700 px-2 py-0.5 rounded">SENT</span>
                                <span className="text-[10px] text-gray-500">2 mins ago</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-400 truncate max-w-[100px]">To: 0x82...91a</div>
                                <div className="font-mono text-sm text-white font-bold">- 120.00 LYR</div>
                            </div>
                        </div>

                        {/* Empty State Mock */}
                        <div className="p-8 text-center opacity-40 mt-8">
                            <div className="text-4xl mb-2">📜</div>
                            <p className="text-xs text-gray-400">No more history</p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <button className="w-full py-3 text-xs font-bold text-gray-400 hover:text-white bg-white/5 rounded-xl transition-colors">View All History</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
