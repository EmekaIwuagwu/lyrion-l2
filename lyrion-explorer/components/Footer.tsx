"use client";

import React from "react";

export function Footer() {
    return (
        <footer className="border-t border-white/5 pt-16 mt-24 relative z-10 bg-[#0B0E1D]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute w-full h-full border border-purple-500 rounded-full animate-[spin_8s_linear_infinite]"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                        </div>
                        <span className="font-heading text-xl font-bold text-white tracking-widest">LYRION</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        The cosmic settlement layer for next-gen DeFi.
                        Connecting galaxies of liquidity on Flare Network.
                    </p>
                    <div className="flex gap-4">
                        {['twitter', 'discord', 'github', 'medium'].map(icon => (
                            <div key={icon} className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer">
                                <div className="w-4 h-4 bg-current opacity-80 rounded-sm"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Exploration</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        {['Blocks', 'Transactions', 'Pending Txs', 'Top Accounts', 'Verified Contracts'].map(l => (
                            <li key={l} className="hover:text-cyan-400 cursor-pointer transition-colors w-fit">{l}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Ecosystem</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        {['Lyrion DEX', 'Galactic Bridge', 'Staking Portal', 'Governance', 'Docs'].map(l => (
                            <li key={l} className="hover:text-purple-400 cursor-pointer transition-colors w-fit">{l}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Network</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-green-400 font-mono">Mainnet Alpha</span>
                        </li>
                        <li className="text-gray-400">Gas: <span className="text-pink-400 font-mono">22 Gwei</span></li>
                        <li className="text-gray-400">Version: <span className="text-cyan-400 font-mono">v1.0.2</span></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/5 py-8 flex justify-center text-xs text-gray-600 font-mono">
                &copy; 2026 LYRION FOUNDATION. TRANSMITTING FROM DEEP SPACE.
            </div>
        </footer>
    );
}
