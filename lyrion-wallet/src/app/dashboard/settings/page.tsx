"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import {
    Globe,
    ShieldCheck,
    Trash2,
    KeyRound,
    Eye,
    EyeOff,
    Copy,
    Check,
    ShieldAlert
} from "lucide-react";

export default function SettingsPage() {
    const router = useRouter();
    const { rpcUrl, updateRpcUrl, lockWallet, unlockWallet, wallet, isUnlocked } = useWallet();
    const [urlInput, setUrlInput] = useState(rpcUrl);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!isUnlocked) router.push("/login");
    }, [isUnlocked, router]);

    // Private Key Reveal State
    const [isRevealing, setIsRevealing] = useState(false);
    const [password, setPassword] = useState("");
    const [revealedKey, setRevealedKey] = useState("");
    const [revealError, setRevealError] = useState("");
    const [copyKey, setCopyKey] = useState(false);

    const handleSaveRpc = (e: React.FormEvent) => {
        e.preventDefault();
        updateRpcUrl(urlInput);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        if (confirm("DANGER: This will delete your wallet from this browser. Make sure you have your Seed Phrase saved! Are you sure?")) {
            localStorage.removeItem("lyr_enc_wallet");
            lockWallet();
            window.location.href = "/";
        }
    };

    const handleReveal = async (e: React.FormEvent) => {
        e.preventDefault();
        setRevealError("");

        // We try to unlock (decrypt) again to verify password and get raw key
        // Since 'wallet' in context is already decrypted, we theoretically have the key.
        // BUT, for security, we force the user to re-enter password to prove it's them right now.

        try {
            const success = await unlockWallet(password);
            if (success && wallet) {
                setRevealedKey(wallet.privateKey);
            } else {
                setRevealError("Incorrect password");
            }
        } catch (e) {
            setRevealError("Verified failed");
        }
    };

    const copyPrivateKey = () => {
        if (revealedKey) {
            navigator.clipboard.writeText(revealedKey);
            setCopyKey(true);
            setTimeout(() => setCopyKey(false), 2000);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-2xl pb-20">
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

            {/* Network Settings */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Network Connection</h2>
                        <p className="text-sm text-gray-400">Manage your RPC Provider</p>
                    </div>
                </div>

                <form onSubmit={handleSaveRpc} className="space-y-4 pt-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">RPC URL</label>
                        <div className="flex gap-2">
                            <input
                                type="tex"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none input-field"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors"
                            >
                                {saved ? "Saved" : "Save"}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Default: http://localhost:8545</p>
                    </div>
                </form>
            </div>

            {/* Private Key Export */}
            <div className="glass-panel rounded-2xl p-6 space-y-4 border-yellow-500/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Export Private Key</h2>
                        <p className="text-sm text-gray-400">View your raw private key</p>
                    </div>
                </div>

                {!isRevealing ? (
                    <button
                        onClick={() => setIsRevealing(true)}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-colors border border-white/10"
                    >
                        Reveal Private Key
                    </button>
                ) : (
                    <div className="bg-black/40 rounded-xl p-6 space-y-4 border border-white/5">
                        {!revealedKey ? (
                            <form onSubmit={handleReveal} className="space-y-4">
                                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-xs mb-4">
                                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                    <p>Warning: Never share your private key. Anyone with this key can steal all your assets.</p>
                                </div>
                                <label className="text-sm text-gray-400">Enter Password to Confirm</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full input-field rounded-xl px-4 py-3"
                                    placeholder="Password"
                                    autoFocus
                                />
                                {revealError && <p className="text-red-400 text-xs">{revealError}</p>}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsRevealing(false)}
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold"
                                    >
                                        View Key
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <label className="text-sm text-red-400 font-bold block">YOUR PRIVATE KEY</label>
                                <div className="p-4 bg-slate-900 border border-red-500/30 rounded-xl break-all font-mono text-xs text-red-200 blur-0 relative group">
                                    {revealedKey}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={copyPrivateKey}
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                                    >
                                        {copyKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copyKey ? "Copied" : "Copy"}
                                    </button>
                                    <button
                                        onClick={() => { setIsRevealing(false); setRevealedKey(""); setPassword(""); }}
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 font-bold"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Security */}
            <div className="glass-panel rounded-2xl p-6 space-y-6 border-red-500/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Reset Wallet</h2>
                        <p className="text-sm text-gray-400">Danger Zone</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleReset}
                        className="w-full p-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 flex items-center justify-between group transition-all"
                    >
                        <div className="text-left">
                            <span className="font-bold block">Reset Wallet</span>
                            <span className="text-xs opacity-70">Removes wallet from this device. Requires seed phrase to restore.</span>
                        </div>
                        <Trash2 className="w-5 h-5 group-hover:text-red-300" />
                    </button>
                </div>
            </div>

        </div>
    );
}
