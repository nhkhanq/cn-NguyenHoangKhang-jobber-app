import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

// Helper function to get valid private key
function getPrivateKey(): string[] {
  const privateKey = process.env.PRIVATE_KEY;
  if (privateKey && privateKey.length >= 64) {
    return [privateKey];
  }
  return [];
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      // Use default accounts for local testing
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000"
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      // Use default accounts for local testing
      timeout: 60000
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: getPrivateKey(),
      chainId: 11155111,
      timeout: 60000,
      gasPrice: 20000000000
    },
    mainnet: {
      url: process.env.ETHEREUM_RPC_URL || "",
      accounts: getPrivateKey(),
      chainId: 1,
      timeout: 60000
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test/contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config; 