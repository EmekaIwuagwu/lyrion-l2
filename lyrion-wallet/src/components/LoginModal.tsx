"use client";

import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Key, ArrowRight, Loader } from 'lucide-react';

export default function LoginModal() {
    const { login, isLoading } = useWallet();
    const [val, setVal] = useState("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"); // Alice Default

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (val) await login(val);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Card */}
            <div className="relative w-full max-w-md glass-panel rounded-2xl p-8 animate-float">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full primary-gradient flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/20">
                        <Key className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Access your Lyrion L2 Assets</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Private Key</label>
                        <input
                            type="password"
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="0x..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full primary-gradient h-12 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Unlock Wallet
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500">
                        Demo Key (Alice) Pre-filled for Convenience
                    </p>
                </div>
            </div>
        </div>
    );
}
