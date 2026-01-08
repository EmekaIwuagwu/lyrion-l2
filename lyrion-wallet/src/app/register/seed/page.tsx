"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { Eye, EyeOff, ClipboardCheck, ShieldAlert } from "lucide-react";

export default function SeedPhrasePage() {
    const router = useRouter();
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [wallet, setWallet] = useState<ethers.HDNodeWallet | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const pass = sessionStorage.getItem("lyr_temp_pass");
        if (!pass) {
            router.push("/register/password");
            return;
        }

        // Generate new wallet
        const newWallet = ethers.Wallet.createRandom();
        if (newWallet.mnemonic) {
            setMnemonic(newWallet.mnemonic.phrase.split(" "));
            setWallet(newWallet);
        }
        setLoading(false);
    }, [router]);

    const copyToClipboard = () => {
        if (wallet?.mnemonic) {
            navigator.clipboard.writeText(wallet.mnemonic.phrase);
            alert("Seed phrase copied to clipboard!");
        }
    };

    const handleNext = async () => {
        try {
            setSaving(true);
            const pass = sessionStorage.getItem("lyr_temp_pass");
            if (!pass || !wallet) return;

            // Encrypt wallet
            const encrypted = await wallet.encrypt(pass);
            localStorage.setItem("lyr_enc_wallet", encrypted);

            // Clear sensitive session data
            sessionStorage.removeItem("lyr_temp_pass");

            router.push("/register/terms");
        } catch (e) {
            console.error(e);
            alert("Failed to save wallet. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
            <div className="w-full max-w-md z-10">

                <div className="glass-panel rounded-2xl p-8 space-y-6 animate-fade-in relative overflow-hidden">

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">Secret Recovery Phrase</h1>
                        <p className="text-gray-400">
                            This phrase is the ONLY way to recover your wallet. Do not share it with anyone.
                        </p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
                        <ShieldAlert className="w-6 h-6 text-yellow-500 shrink-0" />
                        <p className="text-xs text-yellow-200">
                            If you lose this phrase, your assets will be gone forever. Lyrion support cannot help you.
                        </p>
                    </div>

                    {/* Mnemonic Grid */}
                    <div className="relative group">
                        <div className={`grid grid-cols-3 gap-3 p-4 bg-black/40 rounded-xl border border-white/5 transition-all duration-500 ${!isRevealed ? "blur-md select-none" : ""}`}>
                            {mnemonic.map((word, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                                    <span className="text-white font-mono font-bold">{word}</span>
                                </div>
                            ))}
                        </div>

                        {!isRevealed && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                    onClick={() => setIsRevealed(true)}
                                    className="px-6 py-3 bg-slate-800/90 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-xl backdrop-blur-sm"
                                >
                                    <Eye className="w-5 h-5" />
                                    Click to Reveal
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <button
                            onClick={copyToClipboard}
                            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2 transition-colors"
                        >
                            <ClipboardCheck className="w-4 h-4" />
                            Copy to clipboard
                        </button>

                        {isRevealed && (
                            <button onClick={() => setIsRevealed(false)} className="text-gray-500 hover:text-white text-sm flex items-center gap-2">
                                <EyeOff className="w-4 h-4" />
                                Hide
                            </button>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleNext}
                            disabled={!isRevealed || saving}
                            className="w-full btn-primary py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:grayscale transition-all"
                        >
                            {saving ? "Creating Wallet..." : "I saved my recovery phrase"}
                        </button>
                    </div>

                </div>

                {/* Progress indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                </div>

            </div>
        </div>
    );
}
