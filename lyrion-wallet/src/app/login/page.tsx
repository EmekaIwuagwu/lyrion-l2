"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
    const router = useRouter();
    const { unlockWallet } = useWallet();
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setIsLoading(true);
        setError("");

        try {
            const success = await unlockWallet(password);
            if (success) {
                router.push("/dashboard");
            } else {
                setError("Incorrect password");
            }
        } catch (err) {
            setError("Failed to unlock wallet");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

            <div className="w-full max-w-sm z-10">
                <div className="glass-panel rounded-2xl p-8 space-y-8 animate-fade-in py-12 border-white/10">

                    <div className="text-center flex flex-col items-center">
                        <div className="mb-6 transform hover:scale-110 transition-transform duration-500">
                            <Logo size="lg" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">Welcome Back</h1>
                        <p className="text-gray-400 mt-2">Enter your password to unlock</p>
                    </div>

                    <form onSubmit={handleUnlock} className="space-y-6">
                        <div className="space-y-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full input-field rounded-xl px-4 py-3 text-white"
                                autoFocus
                            />
                            {error && <p className="text-red-400 text-sm pl-1">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className="w-full btn-primary py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Unlocking...
                                </>
                            ) : (
                                "Unlock Wallet"
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={() => {
                                if (confirm("This will wipe your current wallet. You will need your seed phrase to recover it. Are you sure?")) {
                                    localStorage.removeItem("lyr_enc_wallet");
                                    window.location.href = "/";
                                }
                            }}
                            className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                        >
                            Reset Wallet
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
