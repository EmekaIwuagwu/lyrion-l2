"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { ArrowLeft, ArrowUpRight, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { ethers } from "ethers";
import { motion } from "framer-motion";

export default function SendPage() {
    const router = useRouter();
    const { assets, sendTransaction } = useWallet();

    // Form State
    const [step, setStep] = useState<"input" | "review" | "success">("input");
    const [selectedAssetSymbol, setSelectedAssetSymbol] = useState("LYR");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [txHash, setTxHash] = useState("");

    const selectedAsset = assets.find(a => a.symbol === selectedAssetSymbol) || assets[0];

    const handleReview = () => {
        setError("");
        if (!recipient || !amount) {
            setError("Please fill in all fields");
            return;
        }
        if (parseFloat(amount) <= 0) {
            setError("Amount must be greater than 0");
            return;
        }
        if (parseFloat(amount) > parseFloat(selectedAsset.balance)) {
            setError("Insufficient balance");
            return;
        }
        if (!ethers.isAddress(recipient)) {
            setError("Invalid recipient address");
            return;
        }
        setStep("review");
    };

    const handleSend = async () => {
        setIsLoading(true);
        setError("");
        try {
            const hash = await sendTransaction(recipient, amount, selectedAsset.symbol);
            setTxHash(hash);
            setStep("success");
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Transaction failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto pt-10 pb-20 px-4">

            {/* Header */}
            <div className="flex items-center mb-8">
                <button
                    onClick={() => step === "input" ? router.back() : setStep("input")}
                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {step === "input" ? "Send Assets" : step === "review" ? "Confirm Transfer" : "Sent!"}
                </h1>
            </div>

            {/* Main Card */}
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-3xl p-8 relative overflow-hidden"
            >
                {/* Decorative Blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                {step === "input" && (
                    <div className="space-y-8">
                        {/* Asset Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Asset</label>
                            <div className="grid grid-cols-3 gap-3">
                                {assets.map(asset => (
                                    <button
                                        key={asset.symbol}
                                        onClick={() => setSelectedAssetSymbol(asset.symbol)}
                                        className={`
                                            relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 group
                                            ${selectedAssetSymbol === asset.symbol
                                                ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"}
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${asset.color} flex items-center justify-center text-xs font-bold shadow-md`}>
                                            {asset.icon}
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{asset.symbol}</span>
                                        <span className="text-[10px] text-gray-400 font-mono">{asset.balance}</span>

                                        {selectedAssetSymbol === asset.symbol && (
                                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recipient */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">To</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full input-field rounded-xl px-4 py-4 font-mono text-sm placeholder:text-gray-600 focus:placeholder:text-gray-500"
                                />
                                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-indigo-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Amount</label>
                                <button
                                    onClick={() => setAmount(selectedAsset.balance)}
                                    className="text-xs text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                                >
                                    MAX: {selectedAsset.balance}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full input-field rounded-xl px-4 py-4 text-2xl font-bold font-mono placeholder:text-gray-700"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold pointer-events-none">
                                    {selectedAssetSymbol}
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Button */}
                        <button
                            onClick={handleReview}
                            className="w-full btn-primary py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 group"
                        >
                            <span>Review Transfer</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                {step === "review" && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-sm text-gray-400 mb-2">Sending</span>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-4xl font-bold text-white tracking-tight">{amount}</span>
                                <span className="text-xl text-indigo-400 font-bold mb-1">{selectedAssetSymbol}</span>
                            </div>
                            <span className="text-xs text-gray-500">≈ ${(parseFloat(amount) * 10).toFixed(2)} USD</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-gray-400 text-sm">To</span>
                                <span className="font-mono text-sm text-white truncate max-w-[200px]">{recipient}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-gray-400 text-sm">Network Fee</span>
                                <span className="text-sm text-white">~0.0001 LYR</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-400 text-sm">Total</span>
                                <span className="font-bold text-white">{amount} {selectedAssetSymbol}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="w-full btn-primary py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Broadcasting...</span>
                                </>
                            ) : (
                                <>
                                    <ArrowUpRight className="w-5 h-5" />
                                    <span>Confirm Send</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {step === "success" && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>

                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Transaction Sent!</h2>
                            <p className="text-gray-400 text-sm max-w-[250px] mx-auto break-all">
                                {txHash}
                            </p>
                        </div>

                        <button
                            onClick={() => router.push("/dashboard")}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white border border-white/10 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}

            </motion.div>
        </div>
    );
}
