import { ethers } from "ethers";

async function generateWallet() {
  console.log("🔐 Generating new wallet for development...\n");

  // Create random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log("📋 WALLET INFORMATION:");
  console.log("=" .repeat(60));
  console.log(`Address (Fee Collector): ${wallet.address}`);
  console.log(`Private Key: ${wallet.privateKey}`);
  console.log(`Mnemonic: ${wallet.mnemonic?.phrase}`);
  console.log("=" .repeat(60));

  console.log("\n⚠️  SECURITY WARNINGS:");
  console.log("- This is for DEVELOPMENT/TESTNET only!");
  console.log("- NEVER use this private key on mainnet!");
  console.log("- Keep private key secure and never commit to git!");
  
  console.log("\n📝 UPDATE YOUR .env FILE:");
  console.log(`PRIVATE_KEY=${wallet.privateKey}`);
  console.log(`FEE_COLLECTOR_ADDRESS=${wallet.address}`);
  
  console.log("\n💰 GET TESTNET ETH:");
  console.log("1. Copy the address above");
  console.log("2. Go to: https://sepoliafaucet.com/");
  console.log("3. Paste address and claim ETH");
  console.log("4. Wait for transaction confirmation");
  
  console.log("\n🚀 NEXT STEPS:");
  console.log("1. Update .env with private key and address");
  console.log("2. Get testnet ETH from faucet");
  console.log("3. Run: npm run deploy:sepolia");
}

generateWallet()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error generating wallet:", error);
    process.exit(1);
  }); 