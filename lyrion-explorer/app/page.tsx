"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { rpcCall } from "@/lib/api";
import Link from "next/link";
import { StatCard } from "@/components/StatCard"; // Reusing types/mock but creating custom cards inline for specific design

// --- UI COMPONENTS ---

const CosmicCard = ({ label, value, sub, icon, accentColor = "purple" }: any) => {
  const accentClass = {
    purple: "from-purple-500 to-indigo-600",
    pink: "from-pink-500 to-rose-500",
    cyan: "from-cyan-400 to-blue-500",
    green: "from-emerald-400 to-green-500",
  }[accentColor] || "from-purple-500 to-indigo-600";

  return (
    <div className="cosmic-card p-6 relative overflow-hidden group">
      {/* Background Glow */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${accentClass} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          {/* Sparkle Icon/Deco */}
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${accentClass} animate-pulse`}></div>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs font-heading font-semibold uppercase tracking-wider mb-1">{label}</h3>
          <div className="text-3xl font-mono font-bold text-white tracking-tight group-hover:text-glow transition-all">{value}</div>
          {sub && <div className="text-xs text-gray-500 mt-2 font-medium">{sub}</div>}
        </div>
      </div>
    </div>
  );
};

const TableRow = ({ type, data, index }: any) => {
  const isBlock = type === 'block';
  // Use fullHash for navigation, hash for display
  const linkHash = data.fullHash || data.hash;
  const displayHash = data.hash;

  return (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group items-center animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
      {/* Icon */}
      <div className="col-span-1 hidden md:flex items-center justify-center">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg border border-white/5 ${isBlock ? 'bg-indigo-500/10 text-indigo-400' : 'bg-pink-500/10 text-pink-400'}`}>
          {isBlock ? '📦' : '📄'}
        </div>
      </div>

      {/* Main Data */}
      <div className="col-span-8 md:col-span-8 flex flex-col justify-center">
        <Link href={isBlock ? `/block/${data.number}` : `/tx/${linkHash}`}>
          <span className={`font-mono text-sm md:text-base font-medium cursor-pointer transition-colors ${isBlock ? 'text-cyan-400 hover:text-cyan-300' : 'text-pink-400 hover:text-pink-300'}`}>
            {isBlock ? `#${data.number}` : displayHash}
          </span>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 font-mono">{data.time}</span>
          {isBlock && <span className="text-[10px] bg-slate-800 px-1.5 rounded text-gray-400">By 0x99..99</span>}
        </div>
      </div>

      {/* Stats/Value */}
      <div className="col-span-4 md:col-span-3 text-right">
        <div className="font-mono text-sm text-gray-200 font-semibold">
          {isBlock ? `${data.txs} Txns` : data.value}
        </div>
        <div className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase tracking-wide">
          {isBlock ? `${data.size} kb` : (data.type || 'Transfer')}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState({
    blockHeight: 0,
    totalTransactions: 0,
    avgBlockTime: 3,
    activeValidators: 1,
    tvl: "0"
  });

  const [latestBlocks, setLatestBlocks] = useState<any[]>([]);
  const [latestTxs, setLatestTxs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch network stats from node
        const networkStats = await rpcCall<any>("lyr_getNetworkStats", []);

        if (networkStats) {
          setStats({
            blockHeight: networkStats.blockHeight || 0,
            totalTransactions: networkStats.totalTransactions || 0,
            avgBlockTime: networkStats.avgBlockTime || 3,
            activeValidators: networkStats.activeValidators || 1,
            tvl: networkStats.tvl || "0"
          });
        }

        const height = networkStats?.blockHeight || 0;

        // Fetch Latest Blocks
        // We'll ask for last 5 blocks
        const blocks: any[] = [];
        const txList: any[] = [];
        const limit = 5;

        for (let i = 0; i < limit; i++) {
          const target = height - i;
          if (target < 0) break;
          const block = await rpcCall<any>("eth_getBlockByNumber", [`0x${target.toString(16)}`]);
          if (block) blocks.push(block);
        }

        if (blocks.length > 0) {
          // Process Blocks
          const mappedBlocks = blocks.map((b: any) => {
            // New format: blocks are flat objects, not {Header, Transactions}
            const blockNum = typeof b.number === 'string'
              ? parseInt(b.number, 16)
              : (b.number ?? 0);
            const txCount = Array.isArray(b.transactions) ? b.transactions.length : 0;
            const timestamp = typeof b.timestamp === 'string'
              ? parseInt(b.timestamp, 16)
              : (b.timestamp || Math.floor(Date.now() / 1000));
            const secsAgo = Math.floor((Date.now() / 1000) - timestamp);

            return {
              number: blockNum,
              hash: b.hash ? `${b.hash.slice(0, 10)}...` : "0x0000...",
              txs: txCount,
              time: secsAgo < 60 ? `${secsAgo}s ago` : `${Math.floor(secsAgo / 60)}m ago`,
              size: (txCount * 0.2 + 0.5).toFixed(2),
              validator: b.miner || "0x9999...9999"
            };
          });
          setLatestBlocks(mappedBlocks);

          // Process Txs - Fetch full tx details using lyr_getTransactionsByBlock
          for (const b of blocks) {
            const blockNum = typeof b.number === 'string' ? parseInt(b.number, 16) : (b.number ?? 0);
            if (blockNum > 0) {
              try {
                const blockTxs = await rpcCall<any[]>("lyr_getTransactionsByBlock", [blockNum]);
                if (blockTxs && blockTxs.length > 0) {
                  const timestamp = typeof b.timestamp === 'string'
                    ? parseInt(b.timestamp, 16)
                    : (b.timestamp || Math.floor(Date.now() / 1000));
                  const secsAgo = Math.floor((Date.now() / 1000) - timestamp);

                  for (const tx of blockTxs) {
                    // Parse value
                    let valueWei: bigint;
                    try {
                      valueWei = BigInt(tx.value || 0);
                    } catch {
                      valueWei = BigInt(0);
                    }
                    const valueEth = Number(valueWei) / 1e18;

                    txList.push({
                      hash: tx.hash ? `${tx.hash.slice(0, 14)}...` : "0x...",
                      fullHash: tx.hash || "",
                      time: secsAgo < 60 ? `${secsAgo}s ago` : `${Math.floor(secsAgo / 60)}m ago`,
                      value: `${valueEth.toFixed(4)} LYR`,
                      type: tx.type === 1 ? "Swap" : tx.type === 2 ? "AddLiquidity" : "Transfer"
                    });
                  }
                }
              } catch (e) {
                console.error(`Failed to fetch txs for block ${blockNum}`, e);
              }
            }
          }
        }

        // Update State
        setLatestTxs(txList.slice(0, 10));

      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 p-8 relative min-h-screen flex flex-col">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none"></div>

        {/* --- HEADER --- */}
        <header className="flex justify-between items-center mb-10 relative z-10">
          {/* Search Bar - Floating Glass */}
          <div className="w-full max-w-2xl">
            <div className="bg-[#151A2C]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center p-1.5 pl-6 shadow-2xl transition-all focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <svg className="w-5 h-5 text-gray-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Search Address / Tx / Block / Token..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none font-medium h-10"
              />
              <div className="bg-[#1E2538] text-gray-400 text-xs px-2 py-1 rounded border border-white/5 mr-2 hidden md:block">CMD + K</div>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95">
                Search
              </button>
            </div>
          </div>

          {/* Wallet Connect */}
          <div className="flex items-center gap-4">
            <div className="bg-[#151A2C] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Lyrion Price</div>
                <div className="text-sm font-mono font-bold text-green-400">$1.24 <span className="text-[10px] text-green-600">▲ 2.4%</span></div>
              </div>
            </div>
            <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-xl font-heading font-semibold text-sm transition-colors backdrop-blur-md">
              Connect Wallet
            </button>
          </div>
        </header>

        {/* --- STATS GRID --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <CosmicCard
            label="Total Blocks"
            value={`#${stats.blockHeight.toLocaleString()}`}
            sub="Avg Time: 3.0s"
            icon="📦"
            accentColor="cyan"
          />
          <CosmicCard
            label="Transactions"
            value={stats.totalTransactions.toLocaleString()}
            sub="Total on chain"
            icon="⚡"
            accentColor="purple"
          />
          <CosmicCard
            label="Validators"
            value={stats.activeValidators.toString()}
            sub="Sequencer Mode"
            icon="👥"
            accentColor="pink"
          />
          <CosmicCard
            label="Pool TVL"
            value={`${(Number(stats.tvl) / 1e18).toFixed(2)} LYR`}
            sub="LYR-FLR Pool"
            icon="🔒"
            accentColor="green"
          />
        </section>

        {/* --- SPLIT LISTS --- */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">

          {/* Latest Blocks Info */}
          <div className="cosmic-card h-[600px] flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-transparent to-white/5">
              <h2 className="font-heading text-xl font-bold text-white tracking-wide">Latest Blocks</h2>
              <button className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full hover:bg-cyan-500/20 transition-colors uppercase tracking-wider">
                View All
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar p-2">
              {latestBlocks.length > 0 ? latestBlocks.map((block, i) => (
                <TableRow
                  key={i}
                  index={i}
                  type="block"
                  data={block}
                />
              )) : (
                <div className="p-8 text-center text-gray-500">Waiting for blocks...</div>
              )}
            </div>
          </div>

          {/* Latest Txs Info */}
          <div className="cosmic-card h-[600px] flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-transparent to-white/5">
              <h2 className="font-heading text-xl font-bold text-white tracking-wide">Latest Transactions</h2>
              <button className="text-xs font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-4 py-1.5 rounded-full hover:bg-pink-500/20 transition-colors uppercase tracking-wider">
                View All
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar p-2">
              {latestTxs.length > 0 ? latestTxs.map((tx, i) => (
                <TableRow
                  key={i}
                  index={i}
                  type="tx"
                  data={tx}
                />
              )) : (
                <div className="p-8 text-center text-gray-500">No recent transactions found</div>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
