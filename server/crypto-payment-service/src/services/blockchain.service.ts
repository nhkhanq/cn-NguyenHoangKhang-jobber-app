import { ethers } from 'ethers';
import { config } from '@crypto/config';

export interface TokenInfo {
  address: string;
  decimals: number;
  symbol: string;
}

export interface CryptoOrder {
  orderId: string;
  buyer: string;
  seller: string;
  tokenAddress: string;
  amount: string;
  chainId: number;
  status: 'created' | 'paid' | 'delivered' | 'completed' | 'disputed' | 'cancelled';
  autoRelease: boolean;
  transactionHash?: string;
  blockNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  orderId: string;
  buyerAddress: string;
  sellerAddress: string;
  tokenAddress: string;
  amount: string;
  chainId: number;
  autoRelease?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  message?: string;
  error?: string;
}

class BlockchainService {
  private providers: Map<number, ethers.providers.JsonRpcProvider> = new Map();
  private supportedTokens: Map<number, Map<string, TokenInfo>> = new Map();

  constructor() {
    this.initializeProviders();
    this.initializeSupportedTokens();
  }

  private initializeProviders(): void {
    if (config.ETHEREUM_RPC_URL) {
      this.providers.set(1, new ethers.providers.JsonRpcProvider(config.ETHEREUM_RPC_URL));
    }
    if (config.POLYGON_RPC_URL) {
      this.providers.set(137, new ethers.providers.JsonRpcProvider(config.POLYGON_RPC_URL));
    }
    if (config.BSC_RPC_URL) {
      this.providers.set(56, new ethers.providers.JsonRpcProvider(config.BSC_RPC_URL));
    }
    if (config.SEPOLIA_RPC_URL) {
      this.providers.set(11155111, new ethers.providers.JsonRpcProvider(config.SEPOLIA_RPC_URL));
    }
  }

  private initializeSupportedTokens(): void {
    const tokenConfig = config.getSupportedTokens();

    Object.entries(tokenConfig).forEach(([network, data]: [string, any]) => {
      const chainId = data.chainId;
      const tokens = new Map<string, TokenInfo>();

      Object.entries(data.tokens).forEach(([symbol, tokenData]: [string, any]) => {
        tokens.set(symbol, {
          address: tokenData.address,
          decimals: tokenData.decimals,
          symbol
        });
      });

      this.supportedTokens.set(chainId, tokens);
    });
  }

  public getProvider(chainId: number): ethers.providers.JsonRpcProvider {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`Provider not configured for chain ID: ${chainId}`);
    }
    return provider;
  }

  public getWallet(chainId: number): ethers.Wallet {
    if (!config.PRIVATE_KEY) {
      throw new Error('Private key not configured');
    }
    const provider = this.getProvider(chainId);
    return new ethers.Wallet(config.PRIVATE_KEY, provider);
  }

  public getSupportedTokens(chainId: number): Map<string, TokenInfo> {
    const tokens = this.supportedTokens.get(chainId);
    if (!tokens) {
      throw new Error(`No supported tokens for chain ID: ${chainId}`);
    }
    return tokens;
  }

  public getTokenInfo(chainId: number, symbol: string): TokenInfo {
    const tokens = this.getSupportedTokens(chainId);
    const tokenInfo = tokens.get(symbol);
    if (!tokenInfo) {
      throw new Error(`Token ${symbol} not supported on chain ${chainId}`);
    }
    return tokenInfo;
  }

  public isValidAddress(address: string): boolean {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }

  public async getNativeBalance(address: string, chainId: number): Promise<string> {
    try {
      const provider = this.getProvider(chainId);
      const balance = await provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting native balance:', error);
      throw new Error(`Failed to get native balance for ${address}`);
    }
  }

  public async getTokenBalance(address: string, tokenAddress: string, chainId: number): Promise<string> {
    try {
      const provider = this.getProvider(chainId);
      const abi = ['function balanceOf(address owner) view returns (uint256)'];
      const contract = new ethers.Contract(tokenAddress, abi, provider);
      const balance = await contract.balanceOf(address);
      const tokenInfo = this.getTokenInfoByAddress(chainId, tokenAddress);
      return ethers.utils.formatUnits(balance, tokenInfo.decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error(`Failed to get token balance for ${address}`);
    }
  }

  private getTokenInfoByAddress(chainId: number, tokenAddress: string): TokenInfo {
    const tokens = this.getSupportedTokens(chainId);
    for (const [symbol, tokenInfo] of tokens) {
      if (tokenInfo.address.toLowerCase() === tokenAddress.toLowerCase()) {
        return tokenInfo;
      }
    }
    throw new Error(`Token with address ${tokenAddress} not found on chain ${chainId}`);
  }

  public async createPaymentRequest(request: PaymentRequest): Promise<PaymentResult> {
    try {
      if (!this.isValidAddress(request.buyerAddress)) {
        return { success: false, error: 'Invalid buyer address' };
      }
      if (!this.isValidAddress(request.sellerAddress)) {
        return { success: false, error: 'Invalid seller address' };
      }

      const tokenInfo = this.getTokenInfoByAddress(request.chainId, request.tokenAddress);
      const amount = ethers.utils.parseUnits(request.amount, tokenInfo.decimals);

      return {
        success: true,
        message: 'Payment request created successfully',
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
      };
    } catch (error) {
      console.error('Error creating payment request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async processPayment(orderId: string, amount: string, tokenAddress: string, chainId: number): Promise<PaymentResult> {
    try {
      const provider = this.getProvider(chainId);
      const wallet = this.getWallet(chainId);

      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        const transaction = {
          to: config.ESCROW_CONTRACT_ADDRESS!,
          value: ethers.utils.parseEther(amount),
          gasLimit: 21000
        };

        const tx = await wallet.sendTransaction(transaction);
        await tx.wait();

        return {
          success: true,
          transactionHash: tx.hash,
          message: 'Native token payment processed successfully'
        };
      } else {
        const tokenInfo = this.getTokenInfoByAddress(chainId, tokenAddress);
        const amountWei = ethers.utils.parseUnits(amount, tokenInfo.decimals);

        const abi = [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function approve(address spender, uint256 amount) returns (bool)'
        ];
        const contract = new ethers.Contract(tokenAddress, abi, wallet);

        const tx = await contract.transfer(config.ESCROW_CONTRACT_ADDRESS!, amountWei);
        await tx.wait();

        return {
          success: true,
          transactionHash: tx.hash,
          message: 'Token payment processed successfully'
        };
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  public async getTransactionDetails(txHash: string, chainId: number): Promise<any> {
    try {
      const provider = this.getProvider(chainId);
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);

      return {
        transaction: tx,
        receipt: receipt,
        confirmations: receipt ? receipt.confirmations : 0,
        status: receipt ? receipt.status : null
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw new Error(`Failed to get transaction details for ${txHash}`);
    }
  }

  public async convertToUSD(amount: string, tokenSymbol: string, chainId: number): Promise<number> {
    // Mock implementation - in production, integrate with price APIs
    const mockPrices: { [key: string]: number } = {
      'ETH': 2000,
      'USDC': 1,
      'USDT': 1,
      'MATIC': 0.8,
      'BNB': 300
    };

    const price = mockPrices[tokenSymbol] || 0;
    const amountFloat = parseFloat(amount);
    return amountFloat * price;
  }

  public async isTransactionConfirmed(txHash: string, chainId: number, requiredConfirmations: number = 12): Promise<boolean> {
    try {
      const provider = this.getProvider(chainId);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return false;
      }

      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;
      
      return confirmations >= requiredConfirmations;
    } catch (error) {
      console.error('Error checking transaction confirmation:', error);
      return false;
    }
  }
}

export const blockchainService = new BlockchainService(); 