import dotenv from 'dotenv';

dotenv.config({});

class Config {
  public NODE_ENV: string | undefined;
  public PORT: string | undefined;
  public CLIENT_URL: string | undefined;
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN: string | undefined;
  public REDIS_HOST: string | undefined;
  public API_GATEWAY_URL: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  
  // Blockchain configuration - ETH only
  public ETHEREUM_RPC_URL: string | undefined;
  public SEPOLIA_RPC_URL: string | undefined;
  public LOCAL_RPC_URL: string | undefined;
  public PRIVATE_KEY: string | undefined;
  
  // Contract addresses
  public ESCROW_CONTRACT_ADDRESS: string | undefined;
  
  // Settings
  public AUTO_RELEASE_DELAY: string | undefined;
  public PLATFORM_FEE_PERCENTAGE: string | undefined;
  public FEE_COLLECTOR_ADDRESS: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.PORT = process.env.PORT || '4008';
    this.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    this.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/jobber-crypto';
    this.JWT_TOKEN = process.env.JWT_TOKEN || 'crypto-payment-secret';
    this.REDIS_HOST = process.env.REDIS_HOST || 'redis://localhost:6379';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || 'amqp://localhost:5672';
    
    // Blockchain configuration - ETH only
    this.ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || '';
    this.SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    this.LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545';
    this.PRIVATE_KEY = process.env.PRIVATE_KEY || '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a';
    
    // Contract addresses - Using valid WETH contract on Sepolia for testing  
    this.ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS || '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
    
    // Settings
    this.AUTO_RELEASE_DELAY = process.env.AUTO_RELEASE_DELAY || '604800'; // 7 days
    this.PLATFORM_FEE_PERCENTAGE = process.env.PLATFORM_FEE_PERCENTAGE || '2000'; // 20%
    this.FEE_COLLECTOR_ADDRESS = process.env.FEE_COLLECTOR_ADDRESS || '';
  }

  public getSupportedTokens(): any {
    return {
      ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: this.ETHEREUM_RPC_URL,
        tokens: {
          ETH: { 
            address: '0x0000000000000000000000000000000000000000', 
            decimals: 18,
            symbol: 'ETH',
            name: 'Ethereum'
          }
        }
      },
      sepolia: {
        chainId: 11155111,
        name: 'Sepolia Testnet',
        rpcUrl: this.SEPOLIA_RPC_URL,
        tokens: {
          ETH: { 
            address: '0x0000000000000000000000000000000000000000', 
            decimals: 18,
            symbol: 'ETH',
            name: 'Ethereum'
          }
        }
      },
      localhost: {
        chainId: 1337,
        name: 'Local Hardhat',
        rpcUrl: this.LOCAL_RPC_URL,
        tokens: {
          ETH: { 
            address: '0x0000000000000000000000000000000000000000', 
            decimals: 18,
            symbol: 'ETH',
            name: 'Ethereum'
          }
        }
      }
    };
  }

  public getChainConfig(chainId: number): any {
    const tokens = this.getSupportedTokens();
    
    switch (chainId) {
      case 1:
        return tokens.ethereum;
      case 11155111:
        return tokens.sepolia;
      case 1337:
        return tokens.localhost;
      default:
        throw new Error(`Unsupported chain ID: ${chainId}. Only Ethereum (1), Sepolia (11155111), and Local (1337) are supported.`);
    }
  }

  public getSupportedChainIds(): number[] {
    return [1, 11155111, 1337]; // Mainnet, Sepolia, Local
  }
}

export const config: Config = new Config(); 