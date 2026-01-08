"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";

export default function ImportWalletPage() {
    const router = useRouter();
    const [seed, setSeed] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seed || !password || !confirmPassword) return;
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Validate Mnemonic
            if (!ethers.Mnemonic.isValidMnemonic(seed)) {
                throw new Error("Invalid Seed Phrase");
            }

            // Create Wallet
            const wallet = ethers.Wallet.fromPhrase(seed);

            // Encrypt & Save
            const encrypted = await wallet.encrypt(password);
            localStorage.setItem("lyr_enc_wallet", encrypted);

            router.push("/dashboard");

        } catch (err: any) {
            setError(err.message || "Failed to import wallet");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
            <div className="w-full max-w-md z-10 space-y-8 animate-fade-in">

                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <div className="glass-panel rounded-2xl p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <KeyRound className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Import Wallet</h1>
                            <p className="text-sm text-gray-400">Restore using seed phrase</p>
                        </div>
                    </div>

                    <form onSubmit={handleImport} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Secret Recovery Phrase</label>
                            <textarea
                                value={seed}
                                onChange={(e) => setSeed(e.target.value)}
                                placeholder="Enter your 12 or 24 word phrase..."
                                className="w-full h-24 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 block mb-2">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 8 chars"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading || !seed || !password}
                            className="w-full btn-primary py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                "Restore Wallet"
                            )}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
