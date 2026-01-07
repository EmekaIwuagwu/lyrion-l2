"use client";

import React from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function PoolsPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#02040a]">
            {/* NavBar (Duplicate for now, will refactor into Layout later) */}


            <div className="flex-1 max-w-5xl mx-auto w-full p-6 z-10">

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Liquidity Pools</h1>
                        <p className="text-gray-400">Earn fees by providing liquidity.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform">
                        <PlusIcon className="w-5 h-5" /> New Position
                    </button>
                </div>

                <div className="dex-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-xs uppercase text-gray-500 font-bold tracking-wider">
                            <tr>
                                <th className="p-6">Pool</th>
                                <th className="p-6">TVL</th>
                                <th className="p-6">Volume 24h</th>
                                <th className="p-6">APR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-[#0f172a]"></div>
                                                <div className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-[#0f172a]"></div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-pink-400 transition-colors">LYR / FLR</div>
                                                <div className="text-xs text-gray-500 bg-white/10 px-1.5 py-0.5 rounded w-fit mt-1">0.3% Fee</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 font-mono text-white">$42,109,240</td>
                                    <td className="p-6 font-mono text-white">$1,204,500</td>
                                    <td className="p-6">
                                        <span className="text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded">24.5%</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
