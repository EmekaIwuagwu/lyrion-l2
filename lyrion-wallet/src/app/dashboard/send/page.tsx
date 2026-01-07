"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function SendPage() {
    const router = useRouter();
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);

    const handleSend = () => {
        setIsConfirming(true);
        setTimeout(() => {
            alert("Transaction Sent!");
            router.push("/dashboard");
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#050508] flex flex-col items-center p-6 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10 mt-12">
                {/* Navbar */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        ← Back
                    </Link>
                    <h1 className="text-xl font-bold font-heading text-white tracking-widest">SEND ASSETS</h1>
                    <div className="w-8"></div>
                </div>

                <div className="glass-panel p-8 rounded-3xl">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                            <Logo size="md" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Asset Select */}
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Asset</label>
                            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Logo size="sm" />
                                    <span className="font-bold text-white">Lyrion (LYR)</span>
                                </div>
                                <span className="text-sm text-gray-400">Balance: 10,450.00</span>
                            </div>
                        </div>

                        {/* Recipient */}
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Recipient Address</label>
                            <input
                                type="text"
                                placeholder="0x..."
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className="input-field w-full p-4 rounded-xl font-mono text-sm"
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="input-field w-full p-4 rounded-xl font-mono text-xl font-bold"
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400 hover:text-cyan-300">
                                    MAX
                                </button>
                            </div>
                            <p className="text-right text-xs text-gray-500 mt-2">≈ $0.00 USD</p>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!address || !amount || isConfirming}
                            className="btn-gorgeous w-full py-4 rounded-xl text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isConfirming ? "Broadcasting..." : "Confirm & Send"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
