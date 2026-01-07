"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

const Section = ({ title, children }: any) => (
    <div className="cosmic-card p-6 mb-6">
        <h3 className="font-heading font-bold text-gray-300 uppercase tracking-widest text-xs mb-6 border-b border-white/5 pb-2">{title}</h3>
        {children}
    </div>
);

const Toggle = ({ label, checked = false }: any) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-gray-300 text-sm">{label}</span>
        <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${checked ? 'bg-cyan-500' : 'bg-gray-700'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all ${checked ? 'left-6' : 'left-1'}`}></div>
        </div>
    </div>
);

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-[#0B0E1D] flex font-sans">
            <Sidebar />
            <main className="flex-1 ml-72 p-8 relative">
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-heading font-bold text-white tracking-wide mb-8">Explorer Settings</h1>

                    <Section title="General Preferences">
                        <Toggle label="Dark Mode (System Default)" checked />
                        <Toggle label="Show Zero-Value Transactions" checked />
                        <Toggle label="Advanced Gas Data in Lists" />
                        <Toggle label="Developer Mode (Raw Hex)" />
                    </Section>

                    <Section title="Network">
                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">RPC Endpoint</label>
                            <input type="text" value="https://rpc.lyrion.network" className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm" readOnly />
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Chain ID</label>
                            <input type="text" value="42069" className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-gray-400 font-mono text-sm" readOnly />
                        </div>
                    </Section>

                    <Section title="API Keys">
                        <p className="text-sm text-gray-500 mb-4">Create API keys to access the Lyrion Data Lake programmatically.</p>
                        <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded text-sm transition-colors">Generate New Key +</button>
                    </Section>
                </div>
                <Footer />
            </main>
        </div>
    );
}
