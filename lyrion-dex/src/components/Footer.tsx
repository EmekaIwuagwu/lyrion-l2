"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export const Footer = () => {
    return (
        <footer className="w-full border-t border-white/5 bg-[#050811] relative z-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Logo size="sm" />
                            <span className="text-xl font-bold tracking-widest text-white font-exo">LYRION</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            The interstellar liquidity layer for the next generation of DeFi. Fast, secure, and beautiful.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer">🐦</div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer">💬</div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer">📚</div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="text-white font-bold mb-6 font-exo tracking-wide">Protocol</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="hover:text-pink-400 cursor-pointer transition-colors">Documentation</li>
                            <li className="hover:text-pink-400 cursor-pointer transition-colors">Governance</li>
                            <li className="hover:text-pink-400 cursor-pointer transition-colors">Yield Farms</li>
                            <li className="hover:text-pink-400 cursor-pointer transition-colors">Bug Bounty</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 font-exo tracking-wide">Support</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="hover:text-pink-400 cursor-pointer transition-colors">Help Center</li>
                            <li className="hover:text-pink-400 cursor-pointer transition-colors">Terms of Service</li>
                            <li className="hover:text-pink-400 cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-pink-400 cursor-pointer transition-colors">Audits</li>
                        </ul>
                    </div>

                    {/* Status Column */}
                    <div>
                        <h4 className="text-white font-bold mb-6 font-exo tracking-wide">Network Status</h4>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-400 uppercase font-bold">Block Height</span>
                                <span className="text-green-400 font-mono text-xs">● Live</span>
                            </div>
                            <div className="text-2xl font-mono text-white mb-1">#14,204,912</div>
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="h-full w-[80%] bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                    <p>© 2026 Lyrion Foundation. All rights reserved.</p>
                    <p className="mt-2 md:mt-0 font-mono">v2.4.0-alpha</p>
                </div>
            </div>
        </footer>
    );
};
