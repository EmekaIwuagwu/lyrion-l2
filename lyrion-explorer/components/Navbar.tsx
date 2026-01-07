"use client";

import React from "react";

export function Navbar() {
    return (
        <nav className="bg-[#121212] border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold">
                        L
                    </div>
                    <span className="text-xl font-semibold text-white tracking-tight">
                        LYRIONSCAN
                    </span>
                </div>

                {/* Navigation Items (Desktop) */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <a href="#" className="text-white hover:text-pink-500 transition-colors">Home</a>
                    <a href="#" className="hover:text-pink-500 transition-colors">Blockchain</a>
                    <a href="#" className="hover:text-pink-500 transition-colors">Tokens</a>
                    <a href="#" className="hover:text-pink-500 transition-colors">APIs</a>
                    <a href="#" className="hover:text-pink-500 transition-colors">More</a>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Network Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Mainnet
                    </div>

                    <button className="hidden md:block bg-pink-600 hover:bg-pink-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
                        Connect Wallet
                    </button>
                </div>
            </div>
        </nav>
    );
}
