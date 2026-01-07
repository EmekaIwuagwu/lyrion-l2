"use client";

import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import LoginModal from '@/components/LoginModal';
import AssetCard from '@/components/AssetCard';
import SendModal from '@/components/SendModal';
import { LogOut, ArrowUpRight, History, Wallet as WalletIcon, RefreshCw, Copy } from 'lucide-react';

export default function Home() {
  const { isConnected, address, balances, logout, refreshBalances, isLoading } = useWallet();
  const [isSendOpen, setIsSendOpen] = useState(false);

  if (!isConnected) return <LoginModal />;

  const copyAddress = () => {
    if (address) navigator.clipboard.writeText(address);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center glass-panel p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg primary-gradient flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">Lyrion Wallet</h1>
            <div className="flex items-center gap-2 cursor-pointer group" onClick={copyAddress}>
              <span className="text-xs text-slate-400 font-mono group-hover:text-indigo-400 transition-colors">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Copy className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={refreshBalances} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden lg:col-span-2 flex flex-col justify-between min-h-[240px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="space-y-1 z-10">
            <span className="text-slate-400 font-medium">Total Portfolio Value</span>
            <h2 className="text-5xl font-bold text-white tracking-tight">$3,542.40</h2>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 mt-2">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-xs font-bold text-green-400">+5.2% (24h)</span>
            </div>
          </div>

          <div className="flex gap-4 mt-8 z-10">
            <button
              onClick={() => setIsSendOpen(true)}
              className="px-6 py-3 rounded-xl primary-gradient text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <ArrowUpRight className="w-5 h-5" />
              Send Assets
            </button>
            <button className="px-6 py-3 rounded-xl glass-button text-white font-medium hover:bg-white/10 transition-colors">
              Bridge to L1
            </button>
          </div>
        </div>

        {/* Recent Activity Mini-List (Placeholder for now) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Recent Activity
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Sent LYR</p>
                    <p className="text-xs text-slate-500">To: 0x709...79C8</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">-10.00</p>
                  <p className="text-xs text-slate-500">2 min ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asset Grid */}
      <section>
        <h3 className="text-xl font-bold text-white mb-6">Your Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard symbol="LYR" balance={balances.LYR} price={2.50} color="indigo" />
          <AssetCard symbol="FLR" balance={balances.FLR} price={0.04} color="pink" />
          <AssetCard symbol="USDT" balance={balances.USDT} price={1.00} color="emerald" />
        </div>
      </section>

      <SendModal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
    </main>
  );
}
