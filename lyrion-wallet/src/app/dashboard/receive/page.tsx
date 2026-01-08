"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { ArrowLeft, Copy, Check, Share2, ShieldCheck, Info } from "lucide-react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";

export default function ReceivePage() {
    const router = useRouter();
    const { address } = useWallet();
    const [copied, setCopied] = useState(false);

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!address) return null;

    return (
        <div className="max-w-xl mx-auto pt-10 pb-20 px-4">

            {/* Header */}
            <div className="flex items-center mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    Receive Assets
                </h1>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-3xl p-8 flex flex-col items-center relative overflow-hidden"
            >
                {/* Glow Effects */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none"></div>

                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Lyrion Network</span>
                    </div>
                    <p className="text-gray-400 text-sm max-w-[280px]">
                        Scan this QR code to deposit LYR, FLR, or USDT to your wallet.
                    </p>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-8 transform transition-transform hover:scale-105 duration-300 group">
                    <div className="relative">
                        <QRCode
                            value={address}
                            size={200}
                            viewBox={`0 0 256 256`}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                        {/* Center Icon Overlay (Optional aesthetic touch) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-bold text-white text-xs">L</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Display */}
                <div className="w-full space-y-4">
                    <div className="relative group">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Your Address</label>
                        <button
                            onClick={copyAddress}
                            className="w-full bg-[#080A15]/60 hover:bg-[#080A15]/80 border border-white/10 hover:border-cyan-500/50 rounded-xl px-4 py-4 flex items-center justify-between group transition-all text-left"
                        >
                            <span className="font-mono text-sm text-gray-300 break-all mr-2 group-hover:text-white transition-colors">
                                {address}
                            </span>
                            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400 group-hover:text-cyan-400" />}
                            </div>
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={copyAddress}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {copied ? "Copied!" : "Copy Address"}
                        </button>
                        <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                    <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-500/80 leading-relaxed">
                        Only send Lyrion Network assets to this address. Sending other assets usually results in permanent loss.
                    </p>
                </div>

            </motion.div>
        </div>
    );
}
