"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownIcon, Cog6ToothIcon, ChevronDownIcon, ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { rpcCall } from "@/lib/api";
import { ethers, formatEther, parseEther } from "ethers";

// Alice's Private Key (Dev)
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC_URL = "http://localhost:8545";

const TOKENS = [
  { symbol: 'LYR', name: 'Lyrion Native', color: 'from-purple-500 to-indigo-600' },
  { symbol: 'FLR', name: 'Flare Native', color: 'from-pink-500 to-rose-500' },
  { symbol: 'USDT', name: 'Tether USD', color: 'from-emerald-500 to-teal-500' },
];

export default function SwapPage() {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [payToken, setPayToken] = useState("LYR");
  const [receiveToken, setReceiveToken] = useState("FLR");
  const [isSwapping, setIsSwapping] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rate, setRate] = useState<number>(0);
  const [balances, setBalances] = useState({ LYR: "0.00", FLR: "0.00", USDT: "0.00" });
  const [showPayDropdown, setShowPayDropdown] = useState(false);
  const [showReceiveDropdown, setShowReceiveDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        // Get Pool Rate (LYR-FLR only for now)
        const pool = await rpcCall<any>("lyr_getPool", ["LYR-FLR"]);
        const r0 = parseInt(pool.reserve0, 16);
        const r1 = parseInt(pool.reserve1, 16);
        if (r0 > 0) {
          setRate(r1 / r0);
        }

        // Get All Balances
        const bals = await rpcCall<any>("lyr_getBalances", [wallet.address]);
        if (bals) {
          setBalances({
            LYR: parseFloat(formatEther(bals.LYR)).toFixed(2),
            FLR: parseFloat(formatEther(bals.FLR)).toFixed(2),
            USDT: parseFloat(formatEther(bals.USDT)).toFixed(2),
          });
        }

      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInput = (val: string) => {
    setPayAmount(val);
    if (rate > 0 && val && payToken === "LYR" && receiveToken === "FLR") {
      setReceiveAmount((parseFloat(val) * rate).toFixed(4));
    } else if (rate > 0 && val && payToken === "FLR" && receiveToken === "LYR") {
      setReceiveAmount((parseFloat(val) / rate).toFixed(4));
    } else {
      setReceiveAmount("");
    }
  };

  const handleReviewSwap = () => {
    if (!payAmount || !receiveAmount) return;

    // Navigate to review page with all swap details
    const params = new URLSearchParams({
      payAmount,
      payToken,
      receiveAmount,
      receiveToken,
      rate: rate.toString(),
    });

    router.push(`/swap/review?${params.toString()}`);
  };

  const switchTokens = () => {
    const temp = payToken;
    setPayToken(receiveToken);
    setReceiveToken(temp);
    setPayAmount("");
    setReceiveAmount("");
  };

  const selectPayToken = (token: string) => {
    if (token === receiveToken) {
      setReceiveToken(payToken);
    }
    setPayToken(token);
    setShowPayDropdown(false);
    setPayAmount("");
    setReceiveAmount("");
  };

  const selectReceiveToken = (token: string) => {
    if (token === payToken) {
      setPayToken(receiveToken);
    }
    setReceiveToken(token);
    setShowReceiveDropdown(false);
    setPayAmount("");
    setReceiveAmount("");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative font-sans">

      {/* Central Glow Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-[500px] relative z-10 perspective-1000">

        {/* Swap Card */}
        <div className="dex-card p-2 md:p-3 transform transition-transform hover:scale-[1.01] duration-500">

          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 mb-2">
            <h2 className="text-white font-bold text-lg tracking-wide font-exo">Swap Assets</h2>
            <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full rotate-0 hover:rotate-90 duration-300">
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Input 1 (Sell) */}
          <div className="dex-input-group p-5 mb-1 group">
            <div className="flex justify-between mb-3">
              <label className="text-xs font-bold text-gray-400 group-hover:text-pink-400 transition-colors uppercase tracking-wider">You Pay</label>
              <span className="text-xs font-bold text-gray-500">Balance: {balances[payToken as keyof typeof balances]}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input
                type="number"
                placeholder="0.0"
                value={payAmount}
                onChange={e => handleInput(e.target.value)}
                className="dex-input-transparent text-4xl placeholder-white/20"
              />

              {/* Token Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowPayDropdown(!showPayDropdown)}
                  className="flex items-center gap-2 bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-2xl border border-white/10 transition-colors shrink-0 shadow-lg hover:border-pink-500/50"
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${TOKENS.find(t => t.symbol === payToken)?.color} shadow-inner`}></div>
                  <span className="font-bold text-xl text-white">{payToken}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </button>

                {showPayDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[180px]">
                    {TOKENS.map(token => (
                      <button
                        key={token.symbol}
                        onClick={() => selectPayToken(token.symbol)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${token.color}`}></div>
                        <div className="text-left">
                          <div className="text-white font-bold">{token.symbol}</div>
                          <div className="text-xs text-gray-400">{token.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Switcher */}
          <div className="relative h-2 flex items-center justify-center -my-3 z-20">
            <button
              onClick={switchTokens}
              className="bg-[#0d101c] border-4 border-[#02040a] p-2 rounded-xl cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 group shadow-xl"
            >
              <ArrowDownIcon className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
            </button>
          </div>

          {/* Input 2 (Buy) */}
          <div className="dex-input-group p-5 mt-1 mb-4 group">
            <div className="flex justify-between mb-3">
              <label className="text-xs font-bold text-gray-400 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">You Receive</label>
              <span className="text-xs font-bold text-gray-500">Balance: {balances[receiveToken as keyof typeof balances]}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input
                type="number"
                placeholder="0.0"
                disabled
                value={receiveAmount}
                className="dex-input-transparent text-4xl placeholder-white/20"
              />

              {/* Token Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowReceiveDropdown(!showReceiveDropdown)}
                  className="flex items-center gap-2 bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-2xl border border-white/10 transition-colors shrink-0 shadow-lg hover:border-cyan-500/50"
                >
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${TOKENS.find(t => t.symbol === receiveToken)?.color} shadow-inner`}></div>
                  <span className="font-bold text-xl text-white">{receiveToken}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </button>

                {showReceiveDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[180px]">
                    {TOKENS.map(token => (
                      <button
                        key={token.symbol}
                        onClick={() => selectReceiveToken(token.symbol)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${token.color}`}></div>
                        <div className="text-left">
                          <div className="text-white font-bold">{token.symbol}</div>
                          <div className="text-xs text-gray-400">{token.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 mt-2 font-mono flex justify-end gap-2">
              <span>Price Impact:</span>
              <span className="text-green-400">~0.05%</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleReviewSwap}
            disabled={!payAmount || isSwapping}
            className="btn-hyper w-full py-5 text-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            REVIEW SWAP
          </button>

        </div>

        {/* Market Info Strip */}
        <div className="mt-8 flex justify-between items-center px-6 py-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400 font-bold uppercase">Rate</div>
            <div className="text-sm font-bold text-white font-mono">1 LYR = {rate ? rate.toFixed(6) : "..."} FLR</div>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
            <span className="text-xs text-pink-400 font-bold uppercase">Gas</span>
            <span className="text-sm font-bold text-white font-mono flex items-center gap-1">
              ⛽ 21 Gwei
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
