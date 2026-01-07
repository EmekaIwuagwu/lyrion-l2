"use client";

import { BookOpenIcon, AcademicCapIcon, ShieldCheckIcon, LightBulbIcon } from "@heroicons/react/24/outline";

export default function LearnPage() {
    const topics = [
        {
            icon: <BookOpenIcon className="w-8 h-8" />,
            title: "How Swapping Works",
            description: "Learn how automated market makers (AMMs) enable decentralized token swaps",
            content: [
                "Lyrion DEX uses an Automated Market Maker (AMM) model, similar to Uniswap.",
                "Instead of order books, liquidity is provided by users in pools.",
                "The constant product formula (x * y = k) determines prices automatically.",
                "When you swap, you're trading against the pool's reserves.",
                "Larger trades relative to pool size result in higher price impact.",
            ],
        },
        {
            icon: <AcademicCapIcon className="w-8 h-8" />,
            title: "Liquidity Provision",
            description: "Understand how to provide liquidity and earn trading fees",
            content: [
                "Liquidity providers (LPs) deposit equal values of both tokens in a pair.",
                "In return, they receive LP tokens representing their share of the pool.",
                "LPs earn 0.3% of all trading fees proportional to their share.",
                "You can withdraw your liquidity at any time by burning LP tokens.",
                "Your share of the pool may change as others add or remove liquidity.",
            ],
        },
        {
            icon: <ShieldCheckIcon className="w-8 h-8" />,
            title: "Impermanent Loss",
            description: "Critical concept every liquidity provider should understand",
            content: [
                "Impermanent loss occurs when token prices diverge from your entry point.",
                "If prices change significantly, you may have less value than just holding.",
                "The loss is 'impermanent' because it only becomes real when you withdraw.",
                "Trading fees can offset impermanent loss over time.",
                "Higher volatility pairs have higher impermanent loss risk.",
                "Example: If ETH doubles vs USD, LPs lose ~5.7% compared to holding.",
            ],
        },
        {
            icon: <LightBulbIcon className="w-8 h-8" />,
            title: "Security Best Practices",
            description: "Stay safe while using DeFi protocols",
            content: [
                "Never share your private keys or seed phrases with anyone.",
                "Always verify contract addresses before interacting.",
                "Start with small amounts when trying new protocols.",
                "Be aware of price impact on large trades.",
                "Use hardware wallets for significant holdings.",
                "Understand that smart contracts carry inherent risks.",
                "Only invest what you can afford to lose.",
            ],
        },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8 relative font-sans">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">Learn DeFi</h1>
                    <p className="text-xl text-gray-400">Master the fundamentals of decentralized trading</p>
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {topics.map((topic, index) => (
                        <div key={index} className="dex-card p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                                    {topic.icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{topic.title}</h2>
                                    <p className="text-sm text-gray-400">{topic.description}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {topic.content.map((point, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-xs text-indigo-400 font-bold">{i + 1}</span>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Resources */}
                <div className="dex-card p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Additional Resources</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a
                            href="https://docs.lyrion.network"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group"
                        >
                            <div className="text-4xl mb-4">📚</div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Documentation</h3>
                            <p className="text-sm text-gray-400">Comprehensive technical docs</p>
                        </a>

                        <a
                            href="https://discord.gg/lyrion"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group"
                        >
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Community</h3>
                            <p className="text-sm text-gray-400">Join our Discord server</p>
                        </a>

                        <a
                            href="https://github.com/lyrion-l2"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group"
                        >
                            <div className="text-4xl mb-4">⚙️</div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">GitHub</h3>
                            <p className="text-sm text-gray-400">Explore the source code</p>
                        </a>
                    </div>
                </div>

                {/* Warning Box */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-yellow-200 mb-2">⚠️ Important Disclaimer</h3>
                    <p className="text-sm text-yellow-200/80">
                        DeFi protocols involve significant risks including smart contract vulnerabilities, impermanent loss, and market volatility.
                        Always do your own research (DYOR) and never invest more than you can afford to lose. This information is for educational
                        purposes only and should not be considered financial advice.
                    </p>
                </div>
            </div>
        </div>
    );
}
