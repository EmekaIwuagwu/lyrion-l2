"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    ArrowRightLeft,
    Settings,
    LogOut
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { Logo } from "@/components/Logo";

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { lockWallet } = useWallet();

    const menuItems = [
        { name: "Dashboard", icon: Home, path: "/dashboard" },
        { name: "Transactions", icon: ArrowRightLeft, path: "/dashboard/transactions" },
        { name: "Settings", icon: Settings, path: "/dashboard/settings" },
    ];

    const handleLogout = () => {
        if (confirm("Are you sure you want to lock your wallet?")) {
            lockWallet();
            router.push("/login");
        }
    };

    return (
        <div className="fixed bottom-0 left-0 w-full h-16 md:relative md:w-64 md:h-screen bg-slate-900/40 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-white/5 z-50 flex md:flex-col justify-between shadow-2xl">

            {/* --- BRAND IDENTITY (Desktop) --- */}
            {/* Matches Explorer Branding exactly, adapted for Wallet */}
            <div className="hidden md:flex flex-col items-center py-8 gap-4 mb-6">
                <div className="transform scale-125 mb-2 hover:scale-110 transition-transform duration-500">
                    <Logo size="md" />
                </div>

                <div className="text-center">
                    <h1 className="font-sans text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-sm">
                        LYRION
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-1 opacity-80">
                        <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold text-shadow-glow">WALLET</span>
                        <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
                    </div>
                </div>
            </div>

            {/* Mobile Logo (Simplified) */}
            <div className="md:hidden flex items-center px-4">
                <Logo size="sm" />
            </div>

            {/* Navigation */}
            <nav className="flex md:flex-col justify-around md:justify-start w-full gap-2 px-2 md:px-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.name}
                            onClick={() => router.push(item.path)}
                            className={`flex flex-col md:flex-row items-center md:gap-4 p-2 md:px-4 md:py-3.5 rounded-xl transition-all duration-300 group ${isActive
                                ? "bg-white/10 text-white border border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <item.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : ''}`} />
                            <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0 tracking-wide">{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout (Desktop) */}
            <div className="hidden md:block mt-auto p-6">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full px-4 py-3.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-wide">Lock Wallet</span>
                </button>
            </div>

        </div>
    );
}
