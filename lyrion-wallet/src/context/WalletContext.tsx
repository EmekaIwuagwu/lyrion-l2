"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// RPC Configuration
const RPC_URL = "http://localhost:8545";

// Types
type Token = 'LYR' | 'FLR' | 'USDT';

interface WalletState {
    address: string | null;
    privateKey: string | null;
    balances: {
        LYR: string;
        FLR: string;
        USDT: string;
    };
    isConnected: boolean;
    isLoading: boolean;
    login: (privateKey: string) => Promise<void>;
    logout: () => void;
    refreshBalances: () => Promise<void>;
    sendTransaction: (to: string, amount: string, token: Token) => Promise<string>;
}

const WalletContext = createContext<WalletState>({} as WalletState);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [address, setAddress] = useState<string | null>(null);
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [balances, setBalances] = useState({ LYR: '0', FLR: '0', USDT: '0' });
    const [isLoading, setIsLoading] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const storedKey = localStorage.getItem('lyrion_priv_key');
        if (storedKey) {
            login(storedKey);
        }
    }, []);

    const login = async (key: string) => {
        setIsLoading(true);
        try {
            if (!key.startsWith('0x')) key = '0x' + key;
            const wallet = new ethers.Wallet(key);
            setAddress(wallet.address);
            setPrivateKey(key);
            localStorage.setItem('lyrion_priv_key', key);
            await fetchBalances(wallet.address);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Invalid Private Key");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setAddress(null);
        setPrivateKey(null);
        setBalances({ LYR: '0', FLR: '0', USDT: '0' });
        localStorage.removeItem('lyrion_priv_key');
    };

    const fetchBalances = async (addr: string) => {
        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);

            // Use our custom RPC method for multi-asset balances
            // Note: ethers.js might not support custom methods directly via standard getBalance
            // So we use the lower-level sending

            const response = await fetch(RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'lyr_getBalances',
                    params: [addr],
                    id: 1
                })
            });

            const data = await response.json();
            if (data.result) {
                setBalances({
                    LYR: ethers.formatEther(data.result.LYR),
                    FLR: ethers.formatEther(data.result.FLR),
                    USDT: ethers.formatEther(data.result.USDT),
                });
            }
        } catch (error) {
            console.error("Failed to fetch balances:", error);
        }
    };

    const refreshBalances = async () => {
        if (address) await fetchBalances(address);
    };

    const sendTransaction = async (to: string, amount: string, token: Token) => {
        if (!privateKey) throw new Error("Wallet not connected");

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);

        // Parse amount to wei
        const weiAmount = ethers.parseEther(amount);

        // Prepare transaction
        let txData = '0x'; // Default for LYR

        if (token !== 'LYR') {
            // For this custom L2, we encode the Token Symbol in the Data field
            // In a real EVM, this would be an ERC20 transfer call
            // But we built the Node to handle this specific "Data = TokenSymbol" logic!
            txData = ethers.hexlify(ethers.toUtf8Bytes(token));
        }

        const tx = {
            to: to,
            value: weiAmount,
            data: txData, // "FLR" or "USDT" or empty for LYR (default)
            // Gas limit hardcoded for now or estimated
            gasLimit: 21000,
        };

        const response = await wallet.sendTransaction(tx);
        await response.wait(); // Wait for confirmation
        await refreshBalances(); // Update UI
        return response.hash;
    };

    return (
        <WalletContext.Provider value={{
            address,
            privateKey,
            balances,
            isConnected: !!address,
            isLoading,
            login,
            logout,
            refreshBalances,
            sendTransaction
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
