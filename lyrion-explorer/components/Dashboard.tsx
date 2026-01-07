"use client";

import { useEffect, useState } from "react";
import { rpcCall } from "@/lib/api";

const ALICE_ADDRESS = "0x1234567890123456789012345678901234567890";

interface Balances {
    LYR: string;
    FLR: string;
}

export default function Dashboard() {
    const [blockNumber, setBlockNumber] = useState<string>("0");
    const [balances, setBalances] = useState<Balances>({ LYR: "0x0", FLR: "0x0" });

    // Refresh loop
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const bn = await rpcCall<string>("eth_blockNumber");
                setBlockNumber(parseInt(bn, 16).toString());

                const bals = await rpcCall<Balances>("lyr_getBalances", [ALICE_ADDRESS]);
                setBalances(bals);
            } catch (e) {
                console.error("Fetch failed", e);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 3000); // 3s poll matching block time
        return () => clearInterval(interval);
    }, []);

    const formatHex = (hex: string) => parseInt(hex, 16).toLocaleString();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Block Height Card */}
            <div className="bg-glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Block Height</h3>
                <p className="text-4xl font-mono mt-2 font-bold text-white group-hover:text-glow transition-all">
                    #{blockNumber}
                </p>
            </div>

            {/* LYR Balance */}
            <div className="bg-glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Lyrion Native (LYR)</h3>
                <p className="text-4xl font-mono mt-2 font-bold text-blue-400 group-hover:text-glow transition-all">
                    {formatHex(balances.LYR)} <span className="text-lg text-white/50">LYR</span>
                </p>
            </div>

            {/* FLR Balance */}
            <div className="bg-glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Flare Wrapped (FLR)</h3>
                <p className="text-4xl font-mono mt-2 font-bold text-teal-400 group-hover:text-glow transition-all">
                    {formatHex(balances.FLR)} <span className="text-lg text-white/50">FLR</span>
                </p>
            </div>
        </div>
    );
}
