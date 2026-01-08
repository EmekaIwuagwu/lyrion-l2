const { ethers } = require("ethers");

async function main() {
    const rpcUrl = "http://localhost:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { batchMaxCount: 1 });

    const userAddress = "0x63dFb57C6247ABB208aFc3112712c43D8749b096"; // User
    const returnAddress = "0x06e64Bdb4ea30E2158C04Bb05df56Ba0F914d648"; // Generated Return Wallet

    console.log("🔍 Checking Balances...");

    const balUser = await provider.getBalance(userAddress);
    console.log(`User Balance:   ${ethers.formatEther(balUser)} LYR`);

    const balReturn = await provider.getBalance(returnAddress);
    console.log(`Return Balance: ${ethers.formatEther(balReturn)} LYR`);
}

main();
