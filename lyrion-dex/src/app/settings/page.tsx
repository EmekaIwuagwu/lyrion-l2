"use client";

import { useState } from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
    const [slippage, setSlippage] = useState("0.5");
    const [deadline, setDeadline] = useState("20");
    const [expertMode, setExpertMode] = useState(false);
    const [customSlippage, setCustomSlippage] = useState("");

    const handleSave = () => {
        // Save settings to localStorage
        localStorage.setItem("lyrion_settings", JSON.stringify({
            slippage: customSlippage || slippage,
            deadline,
            expertMode,
        }));

        // Show success feedback (no alert!)
        const btn = document.getElementById("save-btn");
        if (btn) {
            btn.textContent = "Saved!";
            setTimeout(() => {
                btn.textContent = "Save Settings";
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 relative font-sans">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <Cog6ToothIcon className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white">Settings</h1>
                        <p className="text-gray-400">Configure your trading preferences</p>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="dex-card p-8 space-y-8">
                    {/* Slippage Tolerance */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Slippage Tolerance</h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Your transaction will revert if the price changes unfavorably by more than this percentage.
                        </p>

                        <div className="flex gap-4 mb-4">
                            {["0.1", "0.5", "1.0"].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        setSlippage(val);
                                        setCustomSlippage("");
                                    }}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${slippage === val && !customSlippage
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    {val}%
                                </button>
                            ))}
                            <div className="flex-1">
                                <input
                                    type="number"
                                    placeholder="Custom"
                                    value={customSlippage}
                                    onChange={(e) => setCustomSlippage(e.target.value)}
                                    className="w-full px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                        </div>

                        {(parseFloat(customSlippage || slippage) > 5) && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                <p className="text-xs text-yellow-200">
                                    ⚠️ <strong>Warning:</strong> High slippage tolerance may result in unfavorable trades.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Transaction Deadline */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Transaction Deadline</h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Your transaction will revert if it is pending for more than this duration.
                        </p>

                        <div className="flex gap-4">
                            {["10", "20", "30"].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setDeadline(val)}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all ${deadline === val
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    {val} min
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Expert Mode */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Expert Mode</h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Bypass confirmation modals and allow high price impact trades. Use at your own risk.
                        </p>

                        <label className="flex items-center gap-4 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={expertMode}
                                    onChange={(e) => setExpertMode(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-8 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-600 transition-all"></div>
                                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                            </div>
                            <span className={`font-bold ${expertMode ? "text-white" : "text-gray-400"}`}>
                                {expertMode ? "Enabled" : "Disabled"}
                            </span>
                        </label>

                        {expertMode && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <p className="text-xs text-red-200">
                                    ⚠️ <strong>Danger:</strong> Expert mode removes safety checks. Only enable if you know what you're doing.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Default Token List */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Default Token List</h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Select which token list to use by default.
                        </p>

                        <select className="w-full px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                            <option>Lyrion Default List</option>
                            <option>Community List</option>
                            <option>Custom List</option>
                        </select>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-white/10">
                        <button
                            id="save-btn"
                            onClick={handleSave}
                            className="btn-hyper w-full py-4 text-lg"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                    <p className="text-sm text-blue-200">
                        💡 <strong>Tip:</strong> Your settings are saved locally in your browser and will persist across sessions.
                    </p>
                </div>
            </div>
        </div>
    );
}
