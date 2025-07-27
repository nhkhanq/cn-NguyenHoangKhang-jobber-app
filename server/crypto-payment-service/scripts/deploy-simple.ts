import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying JobberEscrow for ETH payments...");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} ETH`);

  if (parseFloat(ethers.utils.formatEther(balance)) < 0.1) {
    console.error("❌ Insufficient balance! Need at least 0.1 ETH for deployment");
    process.exit(1);
  }

  // Use deployer as fee collector
  const feeCollectorAddress = deployer.address;
  console.log(`🏦 Fee collector: ${feeCollectorAddress}`);

  // Deploy contract
  console.log("\n📝 Deploying JobberEscrow...");
  const JobberEscrow = await ethers.getContractFactory("JobberEscrow");
  
  const escrow = await JobberEscrow.deploy(feeCollectorAddress);
  await escrow.deployed();

  const escrowAddress = escrow.address;
  console.log(`✅ Contract deployed to: ${escrowAddress}`);

  // Only add ETH support (native token)
  console.log("\n🔧 Adding ETH support...");
  const ethAddress = "0x0000000000000000000000000000000000000000";
  try {
    const tx = await escrow.addSupportedToken(ethAddress);
    await tx.wait();
    console.log(`✅ ETH support added`);
  } catch (error) {
    console.log(`ℹ️  ETH support already exists or failed to add`);
  }

  // Set platform fee (20%)
  console.log("\n💼 Setting platform fee to 20%...");
  try {
    const feeeTx = await escrow.setPlatformFeePercentage(2000);
    await feeeTx.wait();
    console.log(`✅ Platform fee set to 20%`);
  } catch (error) {
    console.log(`ℹ️  Platform fee already set or failed to set`);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: escrowAddress,
    feeCollector: feeCollectorAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    supportedTokens: ["ETH"],
    platformFee: "20%",
    autoReleaseDelay: "7 days"
  };

  // Create deployments directory
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment file
  const deploymentFile = path.join(deploymentsDir, `deployment-${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Create .env update file
  const envUpdate = `
# Add this to your .env file:
ESCROW_CONTRACT_ADDRESS=${escrowAddress}
FEE_COLLECTOR_ADDRESS=${feeCollectorAddress}
`;

  const envFile = path.join(__dirname, "../.env.update");
  fs.writeFileSync(envFile, envUpdate);

  // Print summary
  console.log("\n🎉 DEPLOYMENT COMPLETED!");
  console.log("=" .repeat(50));
  console.log(`Contract Address: ${escrowAddress}`);
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Fee Collector: ${feeCollectorAddress}`);
  console.log(`Platform Fee: 20%`);
  console.log(`Supported Token: ETH only`);
  console.log("=" .repeat(50));

  console.log("\n📋 NEXT STEPS:");
  console.log(`1. Copy contract address to your .env:`);
  console.log(`   ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
  console.log(`2. Start the crypto payment service`);
  console.log(`3. Test with a small amount first`);

  console.log("\n🔍 VERIFY CONTRACT (optional):");
  console.log(`npx hardhat verify --network ${network.name} ${escrowAddress} ${feeCollectorAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 