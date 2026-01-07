"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function ReceivePage() {
    const mockAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

    return (
        <div className="min-h-screen bg-[#050508] flex flex-col items-center p-6 relative overflow-hidden font-sans">
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10 mt-12">
                {/* Navbar */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        ← Back
                    </Link>
                    <h1 className="text-xl font-bold font-heading text-white tracking-widest">RECEIVE</h1>
                    <div className="w-8"></div>
                </div>

                <div className="glass-panel p-10 rounded-3xl text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="bg-white p-4 rounded-2xl shadow-xl">
                            {/* Mock QR */}
                            <div className="w-48 h-48 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                                <Logo size="lg" />
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-2">Your Lyrion Address</p>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6 flex items-center justify-between group cursor-pointer hover:border-cyan-500/50 transition-colors">
                        <span className="font-mono text-sm text-white truncate max-w-[200px] md:max-w-none">{mockAddress}</span>
                        <span className="text-cyan-400 text-xs font-bold uppercase group-hover:text-white transition-colors">Copy</span>
                    </div>

                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <p className="text-purple-300 text-xs leading-relaxed">
                            Send only <b className="text-white">Lyrion Network</b> assets to this address.
                            Sending other assets may result in permanent loss.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
