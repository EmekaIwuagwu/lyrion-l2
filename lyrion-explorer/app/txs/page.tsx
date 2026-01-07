"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { rpcCall } from "@/lib/api";
import Link from "next/link";

const TxTableItem = ({ tx }: any) => (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group text-sm">
        <td className="py-4 pl-6">
            <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-lg">
                📄
            </div>
        </td>
        <td className="py-4">
            <Link href={`/tx/${tx.hash}`}>
                <span className="text-pink-400 font-mono text-xs md:text-sm hover:text-pink-300 cursor-pointer truncate max-w-[120px] block">
                    {tx.hash}
                </span>
            </Link>
        </td>
        <td className="py-4">
            <span className="bg-gray-800 border border-gray-700 text-gray-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wide">
                {tx.method || "Transfer"}
            </span>
        </td>
        <td className="py-4 text-gray-400 font-mono text-xs">
            <Link href={`/address/${tx.from}`}><span className="text-pink-400/80 hover:text-pink-400 cursor-pointer">{tx.from}</span></Link>
        </td>
        <td className="py-4">
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center transform rotate-90">
                <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
        </td>
        <td className="py-4 text-gray-400 font-mono text-xs">
            <Link href={`/address/${tx.to}`}><span className="text-pink-400/80 hover:text-pink-400 cursor-pointer">{tx.to}</span></Link>
        </td>
        <td className="py-4 pr-6 text-right">
            <div className="font-mono text-white text-sm">{tx.value} LYR</div>
            <div className="text-[10px] text-gray-500">0.002 TxFee</div>
        </td>
    </tr>
);

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTxs = async () => {
            try {
                const heightHex = await rpcCall<string>("eth_blockNumber", []);
                const height = parseInt(heightHex, 16);

                const txList: any[] = [];
                // Fetch last 10 blocks for txs
                for (let i = 0; i < 10; i++) {
                    const target = height - i;
                    if (target < 0) break;
                    const block = await rpcCall<any>("eth_getBlockByNumber", [`0x${target.toString(16)}`]);
                    if (block && block.Transactions) {
                        for (const tx of block.Transactions) {
                            txList.push({
                                hash: "0x...", // Placeholder until standard hash available
                                from: tx.from || "0x...", // Check casing
                                to: tx.to || "Contract Creation",
                                value: tx.value ? (parseInt(tx.value, 16) / 1e18).toFixed(4) : "0",
                                method: tx.type === 1 ? "Swap" : "Transfer"
                            });
                        }
                    }
                }
                setTransactions(txList);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTxs();
        const interval = setInterval(fetchTxs, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
            <Sidebar />
            <main className="flex-1 ml-72 p-8 relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-white tracking-wide">Transactions</h1>
                            <p className="text-gray-400 text-sm mt-2">Latest activity on Lyrion</p>
                        </div>
                    </div>

                    {/* Data Table Card */}
                    <div className="cosmic-card overflow-hidden bg-[#151A2C]/90 border-pink-500/20">
                        <div className="p-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/20 text-xs uppercase tracking-wider text-gray-500 border-b border-white/5 font-heading">
                                        <th className="py-4 pl-6 w-12 font-semibold"></th>
                                        <th className="py-4 font-semibold">Tx Hash</th>
                                        <th className="py-4 font-semibold">Method</th>
                                        <th className="py-4 font-semibold">From</th>
                                        <th className="py-4 w-12 font-semibold"></th>
                                        <th className="py-4 font-semibold">To</th>
                                        <th className="py-4 pr-6 text-right font-semibold">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading && transactions.length === 0 ? (
                                        <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading transactions...</td></tr>
                                    ) : transactions.length > 0 ? (
                                        transactions.map((tx, i) => (
                                            <TxTableItem key={i} tx={tx} />
                                        ))
                                    ) : (
                                        <tr><td colSpan={7} className="p-8 text-center text-gray-500">No transactions found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}
