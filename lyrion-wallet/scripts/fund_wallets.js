const http = require("http");

// Direct JSON-RPC call without ethers.js complexity
function rpcCall(method, params) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: 1
        });

        const options = {
            hostname: "localhost",
            port: 8545,
            path: "/",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", chunk => body += chunk);
            res.on("end", () => {
                try {
                    const json = JSON.parse(body);
                    if (json.error) {
                        reject(new Error(json.error.message));
                    } else {
                        resolve(json.result);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log("🔗 Testing direct RPC connection...\n");

    // 1. Test basic connectivity
    try {
        const chainId = await rpcCall("eth_chainId", []);
        console.log(`✅ Chain ID: ${chainId} (${parseInt(chainId, 16)})`);
    } catch (e) {
        console.error("❌ eth_chainId failed:", e.message);
        return;
    }

    // 2. Get block number
    try {
        const blockNum = await rpcCall("eth_blockNumber", []);
        console.log(`✅ Block Number: ${blockNum} (${parseInt(blockNum, 16)})`);
    } catch (e) {
        console.error("❌ eth_blockNumber failed:", e.message);
    }

    // 3. Check Alice balance (Genesis account)
    const alice = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    try {
        const balances = await rpcCall("lyr_getBalances", [alice]);
        console.log(`\n📊 Alice Balances:`);
        console.log(`   LYR:  ${parseInt(balances.LYR, 16) / 1e18}`);
        console.log(`   FLR:  ${parseInt(balances.FLR, 16) / 1e18}`);
        console.log(`   USDT: ${parseInt(balances.USDT, 16) / 1e18}`);
    } catch (e) {
        console.error("❌ lyr_getBalances failed:", e.message);
    }

    // 4. Send 2500 LYR to User using eth_sendTransaction (dev mode, no signature needed)
    const userAddress = "0x63dFb57C6247ABB208aFc3112712c43D8749b096";
    const amount = "0x" + (BigInt(2500) * BigInt(1e18)).toString(16); // 2500 LYR in wei

    console.log(`\n💸 Sending 2500 LYR to ${userAddress}...`);
    try {
        const txHash = await rpcCall("eth_sendTransaction", [{
            from: alice,
            to: userAddress,
            value: amount
        }]);
        console.log(`✅ Transaction Hash: ${txHash}`);
    } catch (e) {
        console.error("❌ eth_sendTransaction failed:", e.message);
    }

    // 5. Wait for block to be mined (3 seconds)
    console.log("\n⏳ Waiting for block to be mined (4 seconds)...");
    await new Promise(r => setTimeout(r, 4000));

    // 6. Check User balance
    try {
        const userBal = await rpcCall("lyr_getBalances", [userAddress]);
        console.log(`\n📊 User Balances (${userAddress}):`);
        console.log(`   LYR:  ${parseInt(userBal.LYR, 16) / 1e18}`);
        console.log(`   FLR:  ${parseInt(userBal.FLR, 16) / 1e18}`);
        console.log(`   USDT: ${parseInt(userBal.USDT, 16) / 1e18}`);
    } catch (e) {
        console.error("❌ User balance check failed:", e.message);
    }

    // 7. Generate and fund a return wallet
    const { ethers } = require("ethers");
    const returnWallet = ethers.Wallet.createRandom();

    console.log("\n🔐 Generated Return Wallet:");
    console.log("------------------------------------------------");
    console.log(`Address:     ${returnWallet.address}`);
    console.log(`Private Key: ${returnWallet.privateKey}`);
    console.log(`Mnemonic:    ${returnWallet.mnemonic.phrase}`);
    console.log("------------------------------------------------");

    // Fund return wallet with 100 LYR for testing
    const returnAmount = "0x" + (BigInt(100) * BigInt(1e18)).toString(16);
    console.log(`\n⛽ Funding return wallet with 100 LYR...`);
    try {
        const txHash2 = await rpcCall("eth_sendTransaction", [{
            from: alice,
            to: returnWallet.address,
            value: returnAmount
        }]);
        console.log(`✅ Funding TX Hash: ${txHash2}`);
    } catch (e) {
        console.error("❌ Funding failed:", e.message);
    }

    console.log("\n✅ Setup complete! Wait a few seconds for blocks to mine, then use the wallet.");
}

main().catch(console.error);
