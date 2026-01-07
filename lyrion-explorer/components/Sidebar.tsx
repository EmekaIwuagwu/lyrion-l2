"use client";

import React from "react";
import Link from "next/link";

const NavItem = ({ icon, label, active = false, href = "#" }: any) => (
    <Link href={href} className="block">
        <div className={`
        group flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300
        border border-transparent relative overflow-hidden
        ${active
                ? 'text-white bg-white/5 border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'}
      `}>

            {/* Active Glow Bar */}
            {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.8)]"></div>
            )}

            {/* Icon with Hover Glow */}
            <div className={`text-xl transition-transform group-hover:scale-110 ${active ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}`}>
                {icon}
            </div>

            <span className="font-heading font-medium text-sm tracking-wide z-10">{label}</span>
        </div>
    </Link>
);

export function Sidebar() {
    return (
        <aside className="w-72 h-screen fixed left-0 top-0 bg-[#080A15] border-r border-white/5 flex flex-col z-50 shadow-2xl backdrop-blur-xl">

            {/* --- BRAND IDENTITY --- */}
            <div className="p-8 flex flex-col items-center gap-6 mb-2 relative">
                {/* Logo Container */}
                <div className="relative w-20 h-20 flex items-center justify-center group cursor-pointer">
                    {/* Outer Orbit Ring */}
                    <div className="absolute w-full h-full border border-purple-500/30 rounded-full animate-[spin_8s_linear_infinite] group-hover:border-purple-400/60 transition-colors"></div>
                    <div className="absolute w-full h-full border border-cyan-500/20 rounded-full animate-[spin_12s_linear_infinite_reverse] scale-125"></div>

                    {/* Core Planet */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-900 shadow-[0_0_30px_rgba(124,58,237,0.5)] z-10 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-1/2 bg-white/10 absolute top-0 blur-sm"></div>
                    </div>

                    {/* Orbiting Satellite */}
                    <div className="absolute w-full h-full animate-[spin_4s_linear_infinite]">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[14px]"></div>
                    </div>
                </div>

                {/* Text Logo */}
                <div className="text-center">
                    <h1 className="font-heading text-3xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-sm">
                        LYRION
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-500 font-semibold text-shadow-glow">Explorer</span>
                        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
                    </div>
                </div>
            </div>

            {/* --- NAVIGATION --- */}
            <div className="flex-1 px-6 space-y-3 mt-4 overflow-y-auto">
                <NavItem icon="⚡" label="Dashboard" href="/" />
                <NavItem icon="⛓️" label="Blockchain" href="/blocks" />
                <NavItem icon="📄" label="Transactions" href="/txs" />
                <NavItem icon="🌊" label="DeFi Pools" href="/defi" />
                <NavItem icon="💎" label="Tokens" href="/tokens" />
                <NavItem icon="⚙️" label="Settings" href="/settings" />
            </div>

            {/* --- NETWORK STATUS --- */}
            <div className="p-6 mt-auto">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 backdrop-blur-sm group hover:border-purple-500/30 transition-all">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400 font-heading tracking-wide">NETWORK STATUS</span>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="text-2xl font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">12.4</div>
                        <div className="text-xs text-green-400 font-mono mb-1">TPS</div>
                    </div>
                    <div className="mt-2 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-cyan-500 w-[70%] animate-pulse"></div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
