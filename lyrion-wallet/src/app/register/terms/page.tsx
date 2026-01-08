"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Check } from "lucide-react";

export default function TermsPage() {
    const router = useRouter();
    const [agreed, setAgreed] = useState(false);

    const handleEnter = () => {
        if (agreed) {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
            <div className="w-full max-w-lg z-10 space-y-8 animate-fade-in">

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
                    <p className="text-gray-400">Please review and accept our terms.</p>
                </div>

                <div className="glass-panel rounded-2xl p-1 overflow-hidden h-96 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-gray-300 scrollbar-hide">
                        <h3 className="font-bold text-white">1. Acceptance of Terms</h3>
                        <p>By accessing or using the Lyrion Wallet, you agree to be bound by these Terms of Service.</p>

                        <h3 className="font-bold text-white">2. Self-Custody</h3>
                        <p>Lyrion Wallet is a self-custodial wallet. You are solely responsible for the safety of your private keys and seed phrases. Lyrion cannot recover your funds if you lose your credentials.</p>

                        <h3 className="font-bold text-white">3. Risks</h3>
                        <p>Using blockchain technology involves significant risks, including potential loss of funds due to software bugs, user error, or market volatility.</p>

                        <h3 className="font-bold text-white">4. No Warranty</h3>
                        <p>The software is provided "as is", without warranty of any kind, express or implied.</p>

                        <h3 className="font-bold text-white">5. Compliance</h3>
                        <p>You agree to comply with all applicable laws and regulations in your jurisdiction.</p>
                    </div>

                    <div className="bg-slate-900/50 p-6 border-t border-white/10">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors ${agreed ? "bg-indigo-500 border-indigo-500" : "border-gray-500 group-hover:border-white"}`}>
                                {agreed && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                                I have read and agree to the Terms of Service and Privacy Policy.
                            </span>
                        </label>

                        <button
                            onClick={handleEnter}
                            disabled={!agreed}
                            className="w-full btn-primary py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:grayscale mt-6 transition-all"
                        >
                            Enter Wallet
                        </button>
                    </div>
                </div>

                {/* Progress indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                </div>

            </div>
        </div>
    );
}
