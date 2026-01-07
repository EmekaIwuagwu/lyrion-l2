"use client";

import React from "react";
import Link from "next/link";

export default function StatsPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#02040a]">
            {/* NavBar */}


            <div className="flex-1 max-w-7xl mx-auto w-full p-6 z-10">

                <h1 className="text-3xl font-bold text-white mb-8">Protocol Analytics</h1>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="dex-card p-6">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Total Value Locked</p>
                        <p className="text-3xl font-mono text-white text-shadow-glow">$142.5M</p>
                    </div>
                    <div className="dex-card p-6">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Volume 24H</p>
                        <p className="text-3xl font-mono text-white">$12.1M</p>
                    </div>
                    <div className="dex-card p-6">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Total Fees 24H</p>
                        <p className="text-3xl font-mono text-green-400">$36.2K</p>
                    </div>
                    <div className="dex-card p-6">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Transactions</p>
                        <p className="text-3xl font-mono text-blue-400">14,204</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="dex-card p-8 h-[400px] flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-4">TVL Over Time</h3>
                        <div className="flex-1 bg-gradient-to-b from-purple-500/10 to-transparent rounded-xl border border-white/5 flex items-center justify-center text-gray-500">
                            [Chart Placeholder]
                        </div>
                    </div>
                    <div className="dex-card p-8 h-[400px] flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-4">Volume Over Time</h3>
                        <div className="flex-1 bg-gradient-to-b from-pink-500/10 to-transparent rounded-xl border border-white/5 flex items-center justify-center text-gray-500">
                            [Chart Placeholder]
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
