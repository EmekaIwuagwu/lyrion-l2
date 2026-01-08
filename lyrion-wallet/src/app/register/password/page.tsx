"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function CreatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Save temporary password for the next step (seed generation)
        sessionStorage.setItem("lyr_temp_pass", password);
        router.push("/register/seed");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">

            <div className="w-full max-w-md z-10">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <div className="glass-panel rounded-2xl p-8 space-y-8 animate-fade-in">

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">Create Password</h1>
                        <p className="text-gray-400">This password will unlock your Lyrion wallet only on this device.</p>
                    </div>

                    <form onSubmit={handleNext} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none"
                                    placeholder="Repeat password"
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}
                        </div>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0" />
                            <p className="text-xs text-indigo-200">Lyrion cannot recover this password for you. Please memorize it or write it down.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={!password || !confirmPassword}
                            className="w-full btn-primary py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center"
                        >
                            Create Password
                        </button>
                    </form>

                </div>

                {/* Progress indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                </div>

            </div>
        </div>
    );
}
