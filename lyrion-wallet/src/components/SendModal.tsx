"use client";

import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { X, Send, Loader, ChevronDown, ArrowRight, Wallet } from 'lucide-react';

interface SendModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultToken?: string;
}

const TOKENS = [
    { symbol: 'LYR', name: 'Lyrion Native', balanceKey: 'LYR' },
    { symbol: 'FLR', name: 'Flare Native', balanceKey: 'FLR' },
    { symbol: 'USDT', name: 'Tether USD', balanceKey: 'USDT' },
];

export default function SendModal({ isOpen, onClose, defaultToken = 'LYR' }: SendModalProps) {
    const { sendTransaction, isLoading, balances } = useWallet();
    const [to, setTo] = useState("");
    const [amount, setAmount] = useState("");
    const [token, setToken] = useState(defaultToken);
    const [txHash, setTxHash] = useState<string | null>(null);

    // Steps: input -> review -> sending -> success -> error
    const [step, setStep] = useState<'input' | 'review' | 'sending' | 'success' | 'error'>('input');

    if (!isOpen) return null;

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!to || !amount) return;
        setStep('review');
    };

    const handleConfirm = async () => {
        setStep('sending');
        try {
            // @ts-ignore
            const hash = await sendTransaction(to, amount, token);
            setTxHash(hash);
            setStep('success');
        } catch (error) {
            console.error(error);
            setStep('error');
        }
    };

    const reset = () => {
        setStep('input');
        setTo("");
        setAmount("");
        setTxHash(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={reset} />

            <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 animate-float">
                <button onClick={reset} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <Send className="w-4 h-4 text-indigo-400" />
                    </div>
                    {step === 'review' ? 'Review Transaction' : 'Send Assets'}
                </h2>

                {step === 'success' ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                            <Send className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Transaction Sent!</h3>
                        <p className="text-slate-400 mb-6 text-sm break-all font-mono bg-black/20 p-2 rounded-lg">{txHash}</p>
                        <button onClick={reset} className="w-full glass-button py-3 rounded-xl text-white font-medium hover:bg-white/5">
                            Done
                        </button>
                    </div>
                ) : step === 'review' ? (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-xs text-slate-400 mb-1">Sending amount</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-white">{amount}</span>
                                    <span className="text-lg text-indigo-400 font-medium">{token}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 relative px-2">
                                {/* Connector Line */}
                                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500/50 to-transparent -z-10" />

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                                        From
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-400">My Wallet</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-mono text-white truncate max-w-[200px]">{to}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-xl p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Network Fe</span>
                                    <span className="text-white">0.000021 LYR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total</span>
                                    <span className="text-white font-bold">{amount} {token} + Fee</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={step === 'sending'}
                            className="w-full primary-gradient h-12 rounded-xl text-white font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
                        >
                            {step === 'sending' ? <Loader className="w-5 h-5 animate-spin" /> : 'Confirm & Send'}
                        </button>

                        <button onClick={() => setStep('input')} className="w-full text-sm text-slate-400 hover:text-white transition-colors">
                            Back to Edit
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleReview} className="space-y-4">
                        {/* Recipient Input */}
                        <div>
                            <label className="text-xs font-medium text-slate-400 ml-1 mb-1 block">Recipient Address</label>
                            <input
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                placeholder="0x..."
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm"
                            />
                        </div>

                        {/* Asset Selection & Amount */}
                        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/30">
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-medium text-slate-400">Amount</label>
                                <span className="text-xs text-slate-500">
                                    Balance: {
                                        // @ts-ignore
                                        parseFloat(balances[token]).toLocaleString()
                                    } {token}
                                </span>
                            </div>

                            <div className="flex gap-2 items-center">
                                <input
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder-slate-600"
                                />

                                {/* Custom Dropdown Trigger */}
                                <div className="relative group shrink-0">
                                    <select
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                                    >
                                        {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                                    </select>

                                    <div className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                                        <div className={`w-5 h-5 rounded-full ${token === 'LYR' ? 'bg-indigo-500' : token === 'FLR' ? 'bg-pink-500' : 'bg-emerald-500'} flex items-center justify-center text-[10px] font-bold text-white`}>
                                            {token[0]}
                                        </div>
                                        <span className="font-bold text-white">{token}</span>
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-4 primary-gradient h-12 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
                        >
                            Review Transaction
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
