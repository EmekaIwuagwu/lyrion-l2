"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";

function ReviewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const payAmount = searchParams.get("payAmount") || "0";
    const payToken = searchParams.get("payToken") || "LYR";
    const receiveAmount = searchParams.get("receiveAmount") || "0";
    const receiveToken = searchParams.get("receiveToken") || "FLR";
    const rate = searchParams.get("rate") || "1";

    const handleConfirm = () => {
        // Navigate to status page with transaction details
        router.push(`/swap/status/pending?payAmount=${payAmount}&payToken=${payToken}&receiveAmount=${receiveAmount}&receiveToken=${receiveToken}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative font-sans">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-gray-400 hover:text-white" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">Review Swap</h1>
                </div>

                {/* Review Card */}
                <div className="dex-card p-8 space-y-6">
                    {/* Swap Summary */}
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">You're Swapping</p>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-bold text-white">{payAmount}</span>
                                <span className="text-2xl text-pink-400 font-bold">{payToken}</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="p-3 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                                <ArrowRightIcon className="w-6 h-6 text-indigo-400" />
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">You'll Receive</p>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-bold text-white">{receiveAmount}</span>
                                <span className="text-2xl text-cyan-400 font-bold">{receiveToken}</span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-slate-900/50 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Transaction Details</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Exchange Rate</span>
                                <span className="text-white font-mono">1 {payToken} = {parseFloat(rate).toFixed(6)} {receiveToken}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Price Impact</span>
                                <span className="text-green-400 font-bold">~0.05%</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Network Fee</span>
                                <span className="text-white font-mono">~0.000021 LYR</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Slippage Tolerance</span>
                                <span className="text-white">0.5%</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">Route</span>
                                <span className="text-white font-mono">{payToken} → {receiveToken} Pool</span>
                            </div>
                        </div>
                    </div>

                    {/* Risk Disclaimer */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-xs text-yellow-200">
                            ⚠️ <strong>Important:</strong> Please review all details carefully. Transactions on the blockchain are irreversible.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 btn-hyper py-4 text-lg"
                        >
                            Confirm Swap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
            <ReviewContent />
        </Suspense>
    );
}
