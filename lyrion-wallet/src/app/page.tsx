"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Hero Section */}
      <div className="z-10 flex flex-col items-center max-w-lg w-full text-center space-y-10 animate-fade-in-up">

        {/* Brand Identity */}
        <div className="flex flex-col items-center">
          <div className="mb-8 transform hover:scale-105 transition-transform duration-700 cursor-pointer">
            <Logo size="xl" />
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-indigo-200 drop-shadow-2xl">
            LYRION
          </h1>

          <div className="flex items-center gap-4 mt-4 opacity-70">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-400"></div>
            <span className="text-sm font-bold tracking-[0.4em] text-cyan-400 uppercase">Premium Wallet</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-400"></div>
          </div>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-3 gap-4 w-full opacity-0 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <div className="glass-card p-4 rounded-2xl flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-gray-300 font-bold">Secure</span>
          </div>
          <div className="glass-card p-4 rounded-2xl flex flex-col items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span className="text-xs text-gray-300 font-bold">Fast</span>
          </div>
          <div className="glass-card p-4 rounded-2xl flex flex-col items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            <span className="text-xs text-gray-300 font-bold">L2 Native</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group border border-white/10"
          >
            <span>Access Wallet</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/register/password")}
              className="flex-1 py-4 glass-panel hover:bg-white/10 rounded-2xl text-white font-bold transition-all border border-white/10"
            >
              Create New
            </button>
            <button
              onClick={() => router.push("/import")}
              className="flex-1 py-4 glass-panel hover:bg-white/10 rounded-2xl text-white font-bold transition-all border border-white/10"
            >
              Import
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          Powered by Lyrion Layer 2 • Secured by Flare
        </p>

      </div>
    </div>
  );
}
