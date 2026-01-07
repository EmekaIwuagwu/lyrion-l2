"use client";

import React from "react";
import Link from "next/link";
import { WalletIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export const Navbar = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/10 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">

                {/* Brand */}
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Logo size="md" />
                        <span className="text-2xl font-bold tracking-[0.2em] text-white font-exo group-hover:text-pink-400 transition-colors">
                            LYRION <span className="text-pink-500 text-sm tracking-normal">DEX</span>
                        </span>
                    </Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { name: "Swap", path: "/" },
                            { name: "Pools", path: "/pools" },
                            { name: "Stats", path: "/stats" },
                        ].map((link) => (
                            <Link key={link.name} href={link.path}>
                                <div className={`
                       px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300
                       ${isActive(link.path)
                                        ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}>
                                    {link.name}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Network Pill */}
                    <div className="hidden md:flex items-center gap-2 bg-[#0f121d] border border-white/10 px-4 py-2 rounded-full shadow-inner">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-400">Lyrion Mainnet</span>
                    </div>

                    {/* Connect Button */}
                    <button className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all border border-pink-500/30 hover:border-pink-500/60 backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.1)] hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                        <WalletIcon className="w-4 h-4" /> Connect Wallet
                    </button>
                </div>

            </div>
        </nav>
    );
};
