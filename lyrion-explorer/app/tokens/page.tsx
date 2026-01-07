"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

const TokenRow = ({ rank, name, symbol, price, change, mcap }: any) => (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
        <td className="py-4 pl-6 text-gray-500 font-mono text-sm">{rank}</td>
        <td className="py-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10"></div>
                <div>
                    <div className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors">{name}</div>
                    <div className="text-gray-500 text-xs">{symbol}</div>
                </div>
            </div>
        </td>
        <td className="py-4 text-white font-mono text-sm">${price}</td>
        <td className="py-4">
            <span className={`${change >= 0 ? 'text-green-400' : 'text-red-400'} font-mono text-sm`}>
                {change >= 0 ? '+' : ''}{change}%
            </span>
        </td>
        <td className="py-4 text-white font-mono text-sm">${mcap}</td>
        <td className="py-4 pr-6 text-right">
            <button className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded text-gray-300">Contract</button>
        </td>
    </tr>
);

export default function TokensPage() {
    return (
        <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
            <Sidebar />
            <main className="flex-1 ml-72 p-8 relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-white tracking-wide">Top Tokens</h1>
                            <p className="text-gray-400 text-sm mt-2">Assets by Market Capitalization on Lyrion</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="cosmic-card overflow-hidden bg-[#151A2C]/90 border-green-500/20">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 border-b border-white/5 font-heading">
                                    <th className="py-4 pl-6 w-12">#</th>
                                    <th className="py-4">Token</th>
                                    <th className="py-4">Price</th>
                                    <th className="py-4">24h %</th>
                                    <th className="py-4">Market Cap</th>
                                    <th className="py-4 pr-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <TokenRow rank={1} name="Lyrion Native" symbol="LYR" price="1.24" change={2.45} mcap="142.5M" />
                                <TokenRow rank={2} name="Wrapped Flare" symbol="WFLR" price="0.032" change={-1.2} mcap="45.1M" />
                                <TokenRow rank={3} name="Lyrion USD" symbol="LUSD" price="1.00" change={0.01} mcap="22.4M" />
                                <TokenRow rank={4} name="Cosmic DAO" symbol="CSMC" price="4.20" change={12.4} mcap="12.1M" />
                                <TokenRow rank={5} name="Nebula Yield" symbol="NEB" price="0.45" change={-5.2} mcap="5.6M" />
                                <TokenRow rank={6} name="Void Staked Ether" symbol="vETH" price="2840.12" change={1.2} mcap="4.2M" />
                            </tbody>
                        </table>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}
