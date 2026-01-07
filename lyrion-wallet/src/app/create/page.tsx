"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Mock Seed Generation
const generateMockSeed = () => [
    "alpha", "bravo", "cosmic", "deltas", "echo", "foxtrot",
    "galaxy", "halo", "indigo", "juliet", "kilo", "lyrion"
];

export default function CreateWallet() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [seed, setSeed] = useState<string[]>([]);
    const [isCopied, setIsCopied] = useState(false);

    const startCreation = () => {
        setSeed(generateMockSeed());
        setStep(2);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(seed.join(" "));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const finishSetup = () => {
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none animate-float"></div>

            <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 md:p-12 relative z-10 transition-all duration-500">

                {/* -- Step 1: Warning -- */}
                {step === 1 && (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <span className="text-4xl text-white">🔒</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4 tracking-wide" style={{ fontFamily: '"Exo 2"' }}>Secure Your Journey</h1>
                        <p className="text-gray-400 mb-8 leading-relaxed max-w-md mx-auto">
                            We are about to generate a 12-word <b>Secret Recovery Phrase</b>.
                            This is the <span className="text-pink-400">only key</span> to your assets.
                            If you lose it, your funds are lost forever.
                        </p>

                        <button onClick={startCreation} className="btn-gorgeous w-full py-4 rounded-xl text-white font-bold uppercase tracking-widest text-sm">
                            I Understand, Reveal My Phrase
                        </button>
                        <button onClick={() => router.push("/")} className="mt-4 text-gray-500 hover:text-white text-sm transition-colors">
                            Cancel
                        </button>
                    </div>
                )}

                {/* -- Step 2: Display Seed -- */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-bold text-white mb-2 text-center">Your Secret Phrase</h2>
                        <p className="text-gray-400 text-sm text-center mb-8">Write these down in order and keep them safe.</p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {seed.map((word, i) => (
                                <div key={i} className="bg-black/30 border border-white/10 rounded-lg p-3 flex items-center gap-3 group hover:border-pink-500/50 transition-colors">
                                    <span className="text-gray-600 font-mono text-xs w-4">{i + 1}.</span>
                                    <span className="text-white font-mono font-bold tracking-wide group-hover:text-pink-400">{word}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={copyToClipboard}
                                className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                            >
                                {isCopied ? "✅ Copied!" : "📋 Copy to Clipboard"}
                            </button>
                            <button onClick={finishSetup} className="btn-gorgeous w-full py-4 rounded-xl text-white font-bold uppercase tracking-widest text-sm">
                                I Have Saved It
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Progress Dots */}
            <div className="absolute bottom-10 flex gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? 'bg-pink-500' : 'bg-gray-700'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? 'bg-pink-500' : 'bg-gray-700'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-colors ${step === 3 ? 'bg-pink-500' : 'bg-gray-700'}`}></div>
            </div>
        </div>
    );
}
