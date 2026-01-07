"use client";

import { TrendingUp, TrendingDown } from 'lucide-react';

interface AssetCardProps {
    symbol: string;
    balance: string;
    price?: number;
    color: string;
}

export default function AssetCard({ symbol, balance, price = 1.00, color }: AssetCardProps) {
    // Mock Value Calculation
    const value = (parseFloat(balance) * price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const formattedBalance = parseFloat(balance).toLocaleString('en-US', { maximumFractionDigits: 4 });

    return (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50`} />

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center border border-${color}-500/30`}>
                        <span className={`font-bold text-${color}-400`}>{symbol[0]}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white tracking-wide">{symbol}</h3>
                        <span className="text-xs text-slate-400">Lyrion L2</span>
                    </div>
                </div>
                <div className="bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-medium text-green-400">+2.4%</span>
                </div>
            </div>

            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">{formattedBalance} <span className="text-sm text-slate-500 font-normal">{symbol}</span></h2>
                <p className="text-sm text-slate-400">≈ {value}</p>
            </div>
        </div>
    );
}
