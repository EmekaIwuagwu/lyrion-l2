const { ethers } = require("ethers");

async function main() {
    const rpcUrl = "http://localhost:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { batchMaxCount: 1 });

    // Alice (Genesis Account)
    const alicePk = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const alice = new ethers.Wallet(alicePk, provider);

    // 1. Fund User Wallet
    const userAddress = "0x63dFb57C6247ABB208aFc3112712c43D8749b096";
    const amount = ethers.parseEther("2500");

    console.log(`💸 Sending 2500 LYR to User: ${userAddress}...`);
    try {
        const tx = await alice.sendTransaction({
            to: userAddress,
            value: amount,
            // Nonce management is handled by ethers usually, but node might need simple nonce
        });
        console.log(`✅ Sent! Hash: ${tx.hash}`);
        await tx.wait(); // Wait for mining
    } catch (e) {
        console.error("❌ Transfer Failed:", e.message);
    }

    // 2. Generate New Wallet
    console.log("\n🔐 Generating New Wallet for Returns...");
    const newWallet = ethers.Wallet.createRandom();
    console.log("------------------------------------------------");
    console.log(`Address:     ${newWallet.address}`);
    console.log(`Private Key: ${newWallet.privateKey}`);
    console.log(`Mnemonic:    ${newWallet.mnemonic.phrase}`);
    console.log("------------------------------------------------");
    console.log("⚠️  SAVE THIS PRIVATE KEY SECURELY!  ⚠️");

    // Optional: Fund the new wallet with tiny amount for gas
    console.log(`\n⛽ Funding New Wallet with 10 LYR for gas...`);
    try {
        const tx2 = await alice.sendTransaction({
            to: newWallet.address,
            value: ethers.parseEther("10"),
        });
        console.log(`✅ Funded! Hash: ${tx2.hash}`);
    } catch (e) {
        console.error("❌ Funding Failed:", e.message);
    }
}

main();
