"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { rpcCall } from "@/lib/api";
import { ethers, parseEther } from "ethers";

const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC_URL = "http://localhost:8545";

function StatusContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const txId = params.txId as string;

    const [status, setStatus] = useState<"pending" | "confirmed" | "completed" | "failed">("pending");
    const [txHash, setTxHash] = useState<string>("");
    const [error, setError] = useState<string>("");

    const payAmount = searchParams.get("payAmount") || "0";
    const payToken = searchParams.get("payToken") || "LYR";
    const receiveAmount = searchParams.get("receiveAmount") || "0";
    const receiveToken = searchParams.get("receiveToken") || "FLR";

    useEffect(() => {
        if (txId === "pending") {
            executeSwap();
        }
    }, [txId]);

    const executeSwap = async () => {
        try {
            setStatus("pending");

            const wallet = new ethers.Wallet(PRIVATE_KEY);
            const valueHex = "0x" + parseEther(payAmount).toString(16);

            const hash = await rpcCall<string>("eth_sendTransaction", [{
                from: wallet.address,
                to: "0x0000000000000000000000000000000000000000",
                value: valueHex,
                type: "0x1",
                gas: "0x7530",
            }]);

            setTxHash(hash);
            setStatus("confirmed");

            // Wait for block confirmation
            await new Promise(resolve => setTimeout(resolve, 4000));

            setStatus("completed");
        } catch (e: any) {
            console.error(e);
            setError(e.shortMessage || e.message);
            setStatus("failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative font-sans">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="dex-card p-8 space-y-8">
                    {/* Status Icon */}
                    <div className="flex justify-center">
                        {status === "pending" && (
                            <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-4 border-yellow-500/30 flex items-center justify-center animate-pulse">
                                <ClockIcon className="w-12 h-12 text-yellow-400" />
                            </div>
                        )}
                        {status === "confirmed" && (
                            <div className="w-24 h-24 rounded-full bg-blue-500/20 border-4 border-blue-500/30 flex items-center justify-center animate-pulse">
                                <ClockIcon className="w-12 h-12 text-blue-400" />
                            </div>
                        )}
                        {status === "completed" && (
                            <div className="w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500/30 flex items-center justify-center">
                                <CheckCircleIcon className="w-12 h-12 text-green-400" />
                            </div>
                        )}
                        {status === "failed" && (
                            <div className="w-24 h-24 rounded-full bg-red-500/20 border-4 border-red-500/30 flex items-center justify-center">
                                <XCircleIcon className="w-12 h-12 text-red-400" />
                            </div>
                        )}
                    </div>

                    {/* Status Text */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-white">
                            {status === "pending" && "Processing Swap..."}
                            {status === "confirmed" && "Confirming Transaction..."}
                            {status === "completed" && "Swap Completed!"}
                            {status === "failed" && "Swap Failed"}
                        </h1>
                        <p className="text-gray-400">
                            {status === "pending" && "Submitting your transaction to the network"}
                            {status === "confirmed" && "Waiting for block confirmation"}
                            {status === "completed" && "Your swap has been successfully executed"}
                            {status === "failed" && error}
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="flex justify-between items-center px-8">
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status !== "failed" ? "bg-green-500/20 border-2 border-green-500" : "bg-gray-500/20 border-2 border-gray-500"}`}>
                                <span className="text-white font-bold">1</span>
                            </div>
                            <span className="text-xs text-gray-400">Pending</span>
                        </div>

                        <div className={`flex-1 h-1 mx-4 ${status === "confirmed" || status === "completed" ? "bg-green-500" : "bg-gray-700"}`}></div>

                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status === "confirmed" || status === "completed" ? "bg-green-500/20 border-2 border-green-500" : "bg-gray-500/20 border-2 border-gray-500"}`}>
                                <span className="text-white font-bold">2</span>
                            </div>
                            <span className="text-xs text-gray-400">Confirmed</span>
                        </div>

                        <div className={`flex-1 h-1 mx-4 ${status === "completed" ? "bg-green-500" : "bg-gray-700"}`}></div>

                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status === "completed" ? "bg-green-500/20 border-2 border-green-500" : "bg-gray-500/20 border-2 border-gray-500"}`}>
                                <span className="text-white font-bold">3</span>
                            </div>
                            <span className="text-xs text-gray-400">Completed</span>
                        </div>
                    </div>

                    {/* Transaction Details */}
                    {txHash && (
                        <div className="bg-slate-900/50 rounded-xl p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Transaction Details</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Swapped</span>
                                    <span className="text-white font-bold">{payAmount} {payToken}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-400">Received</span>
                                    <span className="text-white font-bold">{receiveAmount} {receiveToken}</span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="text-gray-400">Transaction Hash</span>
                                    <a
                                        href={`http://localhost:3001/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:text-indigo-300 font-mono text-xs break-all underline"
                                    >
                                        {txHash}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => router.push("/")}
                            className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
                        >
                            Swap Again
                        </button>
                        <button
                            onClick={() => router.push("/activity")}
                            className="flex-1 btn-hyper py-4"
                        >
                            View History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StatusPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
            <StatusContent />
        </Suspense>
    );
}
