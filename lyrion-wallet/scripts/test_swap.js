const http = require("http");

function rpcCall(method, params) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: 1
        });

        const req = http.request({
            hostname: "localhost",
            port: 8545,
            path: "/",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }, (res) => {
            let body = "";
            res.on("data", chunk => body += chunk);
            res.on("end", () => {
                try {
                    const json = JSON.parse(body);
                    if (json.error) reject(new Error(json.error.message));
                    else resolve(json.result);
                } catch (e) { reject(e); }
            });
        });
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    const alice = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const user = "0x63dFb57C6247ABB208aFc3112712c43D8749b096";

    console.log("🔄 Step 1: Alice Swaps 100 LYR -> FLR...");

    // Swap 100 LYR for FLR (type 0x1 = Swap)
    const swapValue = "0x" + (BigInt(100) * BigInt(1e18)).toString(16);

    try {
        const hash = await rpcCall("eth_sendTransaction", [{
            from: alice,
            to: "0x0000000000000000000000000000000000000000", // Pool address (handled internally)
            value: swapValue,
            type: "0x1", // TxTypeSwap
            gas: "0x7530"
        }]);
        console.log("✅ Swap TX submitted:", hash);
    } catch (e) {
        console.error("❌ Swap failed:", e.message);
    }

    // Wait for block
    console.log("⏳ Waiting for block to be mined (4s)...");
    await new Promise(r => setTimeout(r, 4000));

    // Check Alice's FLR balance
    const aliceBals = await rpcCall("lyr_getBalances", [alice]);
    const aliceFLR = BigInt(aliceBals.FLR) / BigInt(1e18);
    console.log(`📊 Alice now has ${aliceFLR} FLR`);

    // Step 2: Send 50 FLR to User
    console.log("\n💸 Step 2: Sending 50 FLR to User...");
    const flrValue = "0x" + (BigInt(50) * BigInt(1e18)).toString(16);

    try {
        const hash2 = await rpcCall("eth_sendTransaction", [{
            from: alice,
            to: user,
            value: flrValue,
            data: "0x" + Buffer.from("FLR").toString("hex") // Token symbol in data
        }]);
        console.log("✅ FLR Transfer TX:", hash2);
    } catch (e) {
        console.error("❌ FLR Transfer failed:", e.message);
    }

    // Wait for block
    console.log("⏳ Waiting for block (4s)...");
    await new Promise(r => setTimeout(r, 4000));

    // Check User balances
    const userBals = await rpcCall("lyr_getBalances", [user]);
    console.log("\n📊 Your Wallet Balances:");
    console.log(`   LYR:  ${BigInt(userBals.LYR) / BigInt(1e18)}`);
    console.log(`   FLR:  ${BigInt(userBals.FLR) / BigInt(1e18)}`);
    console.log(`   USDT: ${BigInt(userBals.USDT) / BigInt(1e18)}`);

    console.log("\n✅ Done! Check your wallet at http://localhost:3001");
}

main().catch(console.error);
