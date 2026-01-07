const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying LYRION L2 Bridge Contracts...\n");

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

    // Deploy LyrionToken
    console.log("📜 Deploying LyrionToken...");
    const LyrionToken = await hre.ethers.getContractFactory("LyrionToken");
    const token = await LyrionToken.deploy(deployer.address); // Bridge address placeholder
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ LyrionToken deployed to:", tokenAddress);

    // Deploy LyrionBridge
    console.log("\n📜 Deploying LyrionBridge...");
    const LyrionBridge = await hre.ethers.getContractFactory("LyrionBridge");
    const bridge = await LyrionBridge.deploy(deployer.address); // Sequencer address
    await bridge.waitForDeployment();
    const bridgeAddress = await bridge.getAddress();
    console.log("✅ LyrionBridge deployed to:", bridgeAddress);

    // Update token's bridge address
    console.log("\n🔗 Setting bridge address in token contract...");
    const tx = await token.setBridge(bridgeAddress);
    await tx.wait();
    console.log("✅ Bridge address updated in token contract");

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("📝 Contract Addresses:");
    console.log("   LyrionToken:  ", tokenAddress);
    console.log("   LyrionBridge: ", bridgeAddress);
    console.log("\n💡 Next Steps:");
    console.log("   1. Update internal/settlement/relayer.go with bridge address");
    console.log("   2. Update internal/config/config.go with token address");
    console.log("   3. Restart the Lyrion node");
    console.log("=".repeat(60) + "\n");

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            LyrionToken: tokenAddress,
            LyrionBridge: bridgeAddress
        }
    };

    fs.writeFileSync(
        'deployment.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("💾 Deployment info saved to deployment.json\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
