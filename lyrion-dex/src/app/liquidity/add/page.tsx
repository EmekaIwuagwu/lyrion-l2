"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { rpcCall } from "@/lib/api";
import { ethers, formatEther, parseEther } from "ethers";

const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC_URL = "http://localhost:8545";

export default function AddLiquidityPage() {
    const router = useRouter();
    const [amountLYR, setAmountLYR] = useState("");
    const [amountFLR, setAmountFLR] = useState("");
    const [balances, setBalances] = useState({ LYR: "0", FLR: "0" });
    const [pool, setPool] = useState({ reserve0: "0", reserve1: "0" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const provider = new ethers.JsonRpcProvider(RPC_URL);
                const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

                const bals = await rpcCall<any>("lyr_getBalances", [wallet.address]);
                if (bals) {
                    setBalances({
                        LYR: parseFloat(formatEther(bals.LYR)).toFixed(2),
                        FLR: parseFloat(formatEther(bals.FLR)).toFixed(2),
                    });
                }

                const poolData = await rpcCall<any>("lyr_getPool", ["LYR-FLR"]);
                setPool({
                    reserve0: formatEther(poolData.reserve0),
                    reserve1: formatEther(poolData.reserve1),
                });
            } catch (e) {
                console.error("Failed to fetch data", e);
            }
        };
        fetchData();
    }, []);

    const handleLYRInput = (val: string) => {
        setAmountLYR(val);
        if (val && parseFloat(pool.reserve0) > 0) {
            const ratio = parseFloat(pool.reserve1) / parseFloat(pool.reserve0);
            setAmountFLR((parseFloat(val) * ratio).toFixed(4));
        }
    };

    const handleReview = () => {
        if (!amountLYR || !amountFLR) return;

        const params = new URLSearchParams({
            amountLYR,
            amountFLR,
            action: "add",
        });

        router.push(`/liquidity/review?${params.toString()}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative font-sans">
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
                    <h1 className="text-3xl font-bold text-white">Add Liquidity</h1>
                </div>

                {/* Add Liquidity Card */}
                <div className="dex-card p-8 space-y-6">
                    <p className="text-gray-400">Add liquidity to the LYR-FLR pool and earn trading fees</p>

                    {/* LYR Input */}
                    <div className="dex-input-group p-6">
                        <div className="flex justify-between mb-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">LYR Amount</label>
                            <span className="text-xs font-bold text-gray-500">Balance: {balances.LYR}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <input
                                type="number"
                                placeholder="0.0"
                                value={amountLYR}
                                onChange={e => handleLYRInput(e.target.value)}
                                className="dex-input-transparent text-4xl placeholder-white/20"
                            />
                            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10 shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600"></div>
                                <span className="font-bold text-xl text-white">LYR</span>
                            </div>
                        </div>
                    </div>

                    {/* Plus Icon */}
                    <div className="flex justify-center">
                        <div className="p-3 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                            <PlusIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>

                    {/* FLR Input */}
                    <div className="dex-input-group p-6">
                        <div className="flex justify-between mb-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">FLR Amount</label>
                            <span className="text-xs font-bold text-gray-500">Balance: {balances.FLR}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <input
                                type="number"
                                placeholder="0.0"
                                value={amountFLR}
                                disabled
                                className="dex-input-transparent text-4xl placeholder-white/20"
                            />
                            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10 shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500"></div>
                                <span className="font-bold text-xl text-white">FLR</span>
                            </div>
                        </div>
                    </div>

                    {/* Pool Info */}
                    <div className="bg-slate-900/50 rounded-xl p-6 space-y-3 text-sm">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Position Preview</h3>

                        <div className="flex justify-between">
                            <span className="text-gray-400">Pool Share</span>
                            <span className="text-white font-bold">~0.1%</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-400">LP Tokens</span>
                            <span className="text-white font-mono">{amountLYR || "0"}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-400">Est. APR</span>
                            <span className="text-green-400 font-bold">12.5%</span>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-xs text-blue-200">
                            💡 <strong>Tip:</strong> Your liquidity will be added at the current pool ratio. You'll earn 0.3% of all trades proportional to your share of the pool.
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleReview}
                        disabled={!amountLYR || !amountFLR}
                        className="btn-hyper w-full py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Review Addition
                    </button>
                </div>
            </div>
        </div>
    );
}
