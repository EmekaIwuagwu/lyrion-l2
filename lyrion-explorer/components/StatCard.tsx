"use client";

import React from "react";

interface StatCardProps {
    label: string;
    value: string;
    subValue?: string;
    icon: string;
    color?: "blue" | "pink" | "purple";
}

export function StatCard({ label, value, subValue, icon, color = "blue" }: StatCardProps) {
    const glowClass = {
        blue: "group-hover:text-blue-400",
        pink: "group-hover:text-pink-400",
        purple: "group-hover:text-purple-400",
    }[color];

    return (
        <div className="glass-panel p-6 rounded-xl group transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
                    <div className={`text-2xl font-mono font-bold text-white ${glowClass} transition-colors`}>
                        {value}
                    </div>
                    {subValue && (
                        <div className="mt-1 text-xs text-gray-500 font-mono">
                            {subValue}
                        </div>
                    )}
                </div>
                <div className="text-2xl opacity-50 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
        </div>
    );
}
