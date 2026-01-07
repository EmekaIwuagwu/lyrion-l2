"use client";

import React from "react";

export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const sizes = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-24 h-24"
    };

    return (
        <div className={`relative flex items-center justify-center group ${sizes[size]}`}>
            {/* Outer Orbit Ring */}
            <div className="absolute w-full h-full border border-purple-500/30 rounded-full animate-[spin_8s_linear_infinite] group-hover:border-purple-400/60 transition-colors"></div>
            <div className="absolute w-full h-full border border-cyan-500/20 rounded-full animate-[spin_12s_linear_infinite_reverse] scale-125"></div>

            {/* Core Planet */}
            <div className="w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-900 shadow-[0_0_30px_rgba(124,58,237,0.5)] z-10 flex items-center justify-center overflow-hidden">
                <div className="w-full h-1/2 bg-white/10 absolute top-0 blur-sm"></div>
            </div>

            {/* Orbiting Satellite */}
            <div className="absolute w-full h-full animate-[spin_4s_linear_infinite]">
                <div className="w-[10%] h-[10%] bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[150%]"></div>
            </div>
        </div>
    );
};
