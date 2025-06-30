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
  
  // Blockchain configuration
  public ETHEREUM_RPC_URL: string | undefined;
  public POLYGON_RPC_URL: string | undefined;
  public BSC_RPC_URL: string | undefined;
  public SEPOLIA_RPC_URL: string | undefined;
  public PRIVATE_KEY: string | undefined;
  
  // Contract addresses
  public ESCROW_CONTRACT_ADDRESS: string | undefined;
  
  // Supported tokens configuration
  public SUPPORTED_TOKENS: string | undefined;
  
  // Settings
  public AUTO_RELEASE_DELAY: string | undefined;
  public PLATFORM_FEE_PERCENTAGE: string | undefined;
  public FEE_COLLECTOR_ADDRESS: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.PORT = process.env.PORT || '4012';
    this.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    this.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/jobber-crypto';
    this.JWT_TOKEN = process.env.JWT_TOKEN || 'crypto-payment-secret';
    this.REDIS_HOST = process.env.REDIS_HOST || 'redis://localhost:6379';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || 'amqp://localhost:5672';
    
    // Blockchain configuration
    this.ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY';
    this.POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
    this.BSC_RPC_URL = process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org';
    this.SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY';
    this.PRIVATE_KEY = process.env.PRIVATE_KEY || '';
    
    // Contract addresses
    this.ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS || '';
    
    // Token configuration
    this.SUPPORTED_TOKENS = process.env.SUPPORTED_TOKENS || JSON.stringify({
      ethereum: {
        chainId: 1,
        tokens: {
          ETH: { address: '0x0000000000000000000000000000000000000000', decimals: 18 },
          USDT: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
          USDC: { address: '0xA0b86a33E6441b59A82e08A7E9FF5e0a6B1C1E92', decimals: 6 }
        }
      },
      polygon: {
        chainId: 137,
        tokens: {
          MATIC: { address: '0x0000000000000000000000000000000000000000', decimals: 18 },
          USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
          USDC: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 }
        }
      }
    });
    
    // Settings
    this.AUTO_RELEASE_DELAY = process.env.AUTO_RELEASE_DELAY || '604800'; // 7 days
    this.PLATFORM_FEE_PERCENTAGE = process.env.PLATFORM_FEE_PERCENTAGE || '2000'; // 20%
    this.FEE_COLLECTOR_ADDRESS = process.env.FEE_COLLECTOR_ADDRESS || '';
  }

  public getSupportedTokens(): any {
    try {
      return JSON.parse(this.SUPPORTED_TOKENS!);
    } catch (error) {
      console.error('Error parsing supported tokens:', error);
      return {};
    }
  }

  public getChainConfig(chainId: number): any {
    const tokens = this.getSupportedTokens();
    
    switch (chainId) {
      case 1:
        return { name: 'Ethereum', rpcUrl: this.ETHEREUM_RPC_URL, ...tokens.ethereum };
      case 137:
        return { name: 'Polygon', rpcUrl: this.POLYGON_RPC_URL, ...tokens.polygon };
      case 56:
        return { name: 'BSC', rpcUrl: this.BSC_RPC_URL, ...tokens.bsc };
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }
}

export const config: Config = new Config(); 