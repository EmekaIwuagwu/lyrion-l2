"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ImportWallet() {
    const router = useRouter();
    const [phrase, setPhrase] = useState("");
    const [loading, setLoading] = useState(false);

    const handleImport = () => {
        setLoading(true);
        // Simulate complex key derivation
        setTimeout(() => {
            router.push("/dashboard");
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-float"></div>

            <div className="glass-panel w-full max-w-xl rounded-3xl p-8 md:p-12 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Exo 2"' }}>Restore Wallet</h1>
                    <p className="text-gray-400 text-sm">Enter your 12 or 24-word Secret Recovery Phrase.</p>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <textarea
                            value={phrase}
                            onChange={(e) => setPhrase(e.target.value)}
                            className="input-field w-full h-40 rounded-xl p-4 text-white font-mono text-sm leading-relaxed resize-none"
                            placeholder="alpha bravo cosmic..."
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-bold pointer-events-none">
                            SECURE & ENCRYPTED
                        </div>
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={loading || phrase.length < 10}
                        className="btn-gorgeous w-full py-4 rounded-xl text-white font-bold uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Restoring Identity..." : "Import Wallet"}
                    </button>

                    <div className="text-center">
                        <Link href="/">
                            <span className="text-gray-500 text-sm hover:text-white cursor-pointer transition-colors">Cancel and Go Back</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
