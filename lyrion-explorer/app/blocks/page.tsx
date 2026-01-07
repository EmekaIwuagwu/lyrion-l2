"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { rpcCall } from "@/lib/api";
import Link from "next/link";

const BlockTableItem = ({ block }: any) => (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
        <td className="py-4 pl-6">
            <Link href={`/block/${block.number}`}>
                <span className="text-cyan-400 font-mono text-sm hover:text-cyan-300 underline decoration-dotted underline-offset-4 cursor-pointer">
                    #{block.number}
                </span>
            </Link>
        </td>
        <td className="py-4 text-sm text-gray-400">
            12 secs ago
        </td>
        <td className="py-4 text-sm text-white font-mono">
            {block.txs}
        </td>
        <td className="py-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600"></div>
                <span className="truncate max-w-[150px] font-mono text-xs">0xValidator...99</span>
            </div>
        </td>
        <td className="py-4 text-sm text-white font-mono">
            15.2 M
        </td>
        <td className="py-4 pr-6 text-sm text-white font-mono">
            2.56 LYR
        </td>
    </tr>
);

export default function BlocksPage() {
    const [currentHeight, setCurrentHeight] = useState(0);

    useEffect(() => {
        rpcCall<string>("eth_blockNumber").then(h => setCurrentHeight(parseInt(h, 16)));
    }, []);

    return (
        <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
            <Sidebar />
            <main className="flex-1 ml-72 p-8 relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-white tracking-wide">Blocks</h1>
                            <p className="text-gray-400 text-sm mt-2">Blocks #0 to #{currentHeight} (Total ~1.2M Blocks)</p>
                        </div>

                        {/* Pagination Controls Mock */}
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 cursor-not-allowed">First</button>
                            <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 cursor-not-allowed">{'<'}</button>
                            <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-cyan-500/30">Page 1 of 1000</span>
                            <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 transition-colors">{'>'}</button>
                            <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 transition-colors">Last</button>
                        </div>
                    </div>

                    {/* Data Table Card */}
                    <div className="cosmic-card overflow-hidden bg-[#151A2C]/90 border-cyan-500/20">
                        <div className="p-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 border-b border-white/5 font-heading">
                                        <th className="py-4 pl-6 font-semibold">Block</th>
                                        <th className="py-4 font-semibold">Age</th>
                                        <th className="py-4 font-semibold">Txn</th>
                                        <th className="py-4 font-semibold">Validator</th>
                                        <th className="py-4 font-semibold">Gas Used</th>
                                        <th className="py-4 pr-6 font-semibold">Reward</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[...Array(20)].map((_, i) => (
                                        <BlockTableItem key={i} block={{ number: currentHeight - i, txs: Math.floor(Math.random() * 200) }} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Footer Paginator */}
                        <div className="p-4 border-t border-white/5 bg-black/10 flex justify-center">
                            <span className="text-xs text-gray-500">Showing last 20 records</span>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}
