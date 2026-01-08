"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers, formatEther, JsonRpcProvider, Wallet } from "ethers";

// Default Lyrion Node URL
const DEFAULT_RPC_URL = "http://localhost:8545";

type Asset = {
    symbol: string;
    name: string;
    balance: string;
    icon: string;
    color: string;
};

interface WalletContextType {
    wallet: Wallet | ethers.HDNodeWallet | null;
    address: string | null;
    isUnlocked: boolean;
    isLoading: boolean;
    rpcUrl: string;
    assets: Asset[];
    unlockWallet: (password: string) => Promise<boolean>;
    lockWallet: () => void;
    refreshBalances: () => Promise<void>;
    updateRpcUrl: (url: string) => void;
    sendTransaction: (to: string, amount: string, token: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [wallet, setWallet] = useState<Wallet | ethers.HDNodeWallet | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [rpcUrl, setRpcUrl] = useState(DEFAULT_RPC_URL);
    const [provider, setProvider] = useState<JsonRpcProvider | null>(null);

    const [assets, setAssets] = useState<Asset[]>([
        { symbol: "LYR", name: "Lyrion", balance: "0.00", icon: "L", color: "from-indigo-500 to-purple-600" },
        { symbol: "FLR", name: "Flare", balance: "0.00", icon: "F", color: "from-pink-500 to-rose-500" },
        { symbol: "USDT", name: "Tether", balance: "0.00", icon: "T", color: "from-emerald-500 to-teal-500" },
    ]);

    // Load RPC URL on mount
    useEffect(() => {
        const savedRpc = localStorage.getItem("lyr_rpc_url");
        if (savedRpc) setRpcUrl(savedRpc);
        setIsLoading(false);
    }, []);

    // Update provider when RPC changes
    useEffect(() => {
        try {
            const newProvider = new JsonRpcProvider(rpcUrl);
            setProvider(newProvider);
            if (wallet) {
                // Re-connect wallet to new provider
                const connectedWallet = wallet.connect(newProvider);
                setWallet(connectedWallet);
            }
        } catch (e) {
            console.error("Invalid RPC URL", e);
        }
    }, [rpcUrl]);

    // Unlock Wallet
    const unlockWallet = async (password: string): Promise<boolean> => {
        const encryptedJson = localStorage.getItem("lyr_enc_wallet");
        if (!encryptedJson) return false;

        try {
            setIsLoading(true);
            const decryptedWallet = await Wallet.fromEncryptedJson(encryptedJson, password);

            let finalWallet = decryptedWallet;
            if (provider) {
                finalWallet = decryptedWallet.connect(provider);
            }

            setWallet(finalWallet);
            setAddress(finalWallet.address);
            setIsUnlocked(true);

            // Initial balance fetch
            // We need to wait a small bit for state to settle or call fetch directly
            setTimeout(() => fetchBalances(finalWallet), 100);

            return true;
        } catch (e) {
            console.error("Unlock failed", e);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const lockWallet = () => {
        setWallet(null);
        setAddress(null);
        setIsUnlocked(false);
    };

    const updateRpcUrl = (url: string) => {
        setRpcUrl(url);
        localStorage.setItem("lyr_rpc_url", url);
    };

    const fetchBalances = async (currentWallet: Wallet | ethers.HDNodeWallet) => {
        if (!currentWallet || !currentWallet.provider) return;
        console.log("Fetching balances for", currentWallet.address);

        try {
            // 1. Get LYR Balance (Native)
            // Note: In Lyrion L2, LYR is the native gas token, but we also have the multi-asset RPC
            // method `lyr_getBalances` which is custom.
            // We will try `eth_getBalance` first for LYR, then the custom one.

            const rpcProvider = currentWallet.provider as JsonRpcProvider;

            // Try custom RPC method first
            try {
                const balances = await rpcProvider.send("lyr_getBalances", [currentWallet.address]);
                console.log("lyr_getBalances result:", balances);

                if (balances) {
                    updateAssetBalance("LYR", formatEther(balances.LYR));
                    updateAssetBalance("FLR", formatEther(balances.FLR));
                    updateAssetBalance("USDT", formatEther(balances.USDT));
                    return;
                }
            } catch (e) {
                console.warn("lyr_getBalances failed, falling back to standard ethos...", e);
            }

            // Fallback: Standard eth_getBalance (Only LYR)
            const bal = await rpcProvider.getBalance(currentWallet.address);
            updateAssetBalance("LYR", formatEther(bal));

        } catch (e) {
            console.error("Failed to fetch balances", e);
        }
    };

    const updateAssetBalance = (symbol: string, val: string) => {
        setAssets(prev => prev.map(a =>
            a.symbol === symbol ? { ...a, balance: parseFloat(val).toFixed(4) } : a
        ));
    };

    const refreshBalances = async () => {
        if (wallet) fetchBalances(wallet);
    };

    // Auto-refresh balances
    useEffect(() => {
        if (!isUnlocked || !wallet) return;
        const interval = setInterval(() => {
            fetchBalances(wallet);
        }, 5000);
        return () => clearInterval(interval);
    }, [isUnlocked, wallet]);

    const sendTransaction = async (to: string, amount: string, token: string): Promise<string> => {
        if (!wallet || !address) throw new Error("Wallet not unlocked");

        const value = ethers.parseEther(amount);
        const valueHex = "0x" + value.toString(16);

        // Use direct RPC call to eth_sendTransaction (dev mode - no signing required)
        const response = await fetch(rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_sendTransaction",
                params: [{
                    from: address,
                    to: to,
                    value: valueHex,
                    // For FLR/USDT, encode token in data field
                    data: token === "LYR" ? "0x" : "0x" + Array.from(new TextEncoder().encode(token)).map(b => b.toString(16).padStart(2, '0')).join('')
                }],
                id: 1
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        // Refresh balances after tx
        setTimeout(() => refreshBalances(), 4000);

        return data.result;
    };

    return (
        <WalletContext.Provider value={{
            wallet,
            address,
            isUnlocked,
            isLoading,
            rpcUrl,
            assets,
            unlockWallet,
            lockWallet,
            refreshBalances,
            updateRpcUrl,
            sendTransaction
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
