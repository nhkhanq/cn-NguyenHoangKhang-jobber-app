import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting JobberEscrow contract deployment...");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);

  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  // Set fee collector address (use deployer address if not specified)
  const feeCollectorAddress = process.env.FEE_COLLECTOR_ADDRESS || deployer.address;
  console.log(`🏦 Fee collector address: ${feeCollectorAddress}`);

  // Deploy JobberEscrow contract
  console.log("\n📝 Deploying JobberEscrow contract...");
  const JobberEscrow = await ethers.getContractFactory("JobberEscrow");
  
  const escrow = await JobberEscrow.deploy(feeCollectorAddress);
  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log(`✅ JobberEscrow deployed to: ${escrowAddress}`);

  // Configure supported tokens based on network
  console.log("\n🔧 Configuring supported tokens...");
  
  const supportedTokens = getSupportedTokensForNetwork(network.chainId);
  
  for (const token of supportedTokens) {
    try {
      const tx = await escrow.addSupportedToken(token.address);
      await tx.wait();
      console.log(`✅ Added token: ${token.symbol} (${token.address})`);
    } catch (error) {
      console.error(`❌ Failed to add token ${token.symbol}:`, error);
    }
  }

  // Set platform fee percentage (20%)
  console.log("\n💼 Setting platform fee...");
  const feePercentage = process.env.PLATFORM_FEE_PERCENTAGE || "2000"; // 20%
  const feeeTx = await escrow.setPlatformFeePercentage(feePercentage);
  await feeeTx.wait();
  console.log(`✅ Platform fee set to: ${parseInt(feePercentage) / 100}%`);

  // Set auto-release delay (7 days)
  console.log("\n⏰ Setting auto-release delay...");
  const autoReleaseDelay = process.env.AUTO_RELEASE_DELAY || "604800"; // 7 days
  const delayTx = await escrow.setAutoReleaseDelay(autoReleaseDelay);
  await delayTx.wait();
  console.log(`✅ Auto-release delay set to: ${parseInt(autoReleaseDelay) / 86400} days`);

  // Save deployment info
  console.log("\n💾 Saving deployment information...");
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    escrowAddress: escrowAddress,
    feeCollectorAddress: feeCollectorAddress,
    platformFeePercentage: feePercentage,
    autoReleaseDelay: autoReleaseDelay,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    supportedTokens: supportedTokens
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}_${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`✅ Deployment info saved to: ${deploymentFile}`);

  // Print summary
  console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
  console.log("=" .repeat(50));
  console.log(`Contract Address: ${escrowAddress}`);
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Fee Collector: ${feeCollectorAddress}`);
  console.log(`Platform Fee: ${parseInt(feePercentage) / 100}%`);
  console.log(`Auto-release: ${parseInt(autoReleaseDelay) / 86400} days`);
  console.log("=" .repeat(50));

  // Print environment variable update
  console.log("\n📋 UPDATE YOUR .env FILE:");
  console.log(`ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);

  // Print verification command
  console.log("\n🔍 VERIFY CONTRACT:");
  console.log(`npx hardhat verify --network ${network.name} ${escrowAddress} ${feeCollectorAddress}`);
}

function getSupportedTokensForNetwork(chainId: bigint): Array<{symbol: string, address: string}> {
  const chainIdNum = Number(chainId);
  
  switch (chainIdNum) {
    case 1: // Ethereum Mainnet
      return [
        { symbol: "ETH", address: "0x0000000000000000000000000000000000000000" },
        { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
        { symbol: "USDC", address: "0xA0b86a33E6441b59A82e08A7E9FF5e0a6B1C1E92" },
        { symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" }
      ];
      
    case 137: // Polygon
      return [
        { symbol: "MATIC", address: "0x0000000000000000000000000000000000000000" },
        { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" },
        { symbol: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" }
      ];
      
    case 56: // BSC
      return [
        { symbol: "BNB", address: "0x0000000000000000000000000000000000000000" },
        { symbol: "BUSD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56" },
        { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955" }
      ];
      
    case 11155111: // Sepolia Testnet
      return [
        { symbol: "ETH", address: "0x0000000000000000000000000000000000000000" }
      ];
      
    case 80001: // Mumbai Testnet
      return [
        { symbol: "MATIC", address: "0x0000000000000000000000000000000000000000" }
      ];
      
    case 97: // BSC Testnet
      return [
        { symbol: "BNB", address: "0x0000000000000000000000000000000000000000" }
      ];
      
    default:
      console.log(`⚠️  Unknown network (${chainIdNum}), only adding native token`);
      return [
        { symbol: "NATIVE", address: "0x0000000000000000000000000000000000000000" }
      ];
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 