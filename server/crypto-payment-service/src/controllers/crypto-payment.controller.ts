import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import { blockchainService } from '../services/blockchain.service';
import { CryptoOrderModel } from '../models/crypto-order.model';
import { PriceService } from '../services/price.service';
import { config } from '../config';

export class CryptoPaymentController {
  
  // Get seller wallet address from their profile
  public async getSellerWallet(req: Request, res: Response): Promise<void> {
    try {
      const { sellerId } = req.params;

      // Call users service internal route (no gateway middleware required)
      const usersServiceUrl = process.env.USERS_SERVICE_URL || 'http://localhost:4003';
      const sellerResponse = await axios.get(`${usersServiceUrl}/api/v1/internal/seller/id/${sellerId}`);
      
      if (!sellerResponse.data?.seller) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: 'Seller not found',
          success: false
        });
        return;
      }

      const seller = sellerResponse.data.seller;
      
      // Get wallet address from socialLinks (first item)
      const walletAddress = seller.socialLinks && seller.socialLinks.length > 0 
        ? seller.socialLinks[0] 
        : null;

      // Validate Ethereum address format
      const isValidEthereumAddress = (address: string): boolean => {
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        return ethAddressRegex.test(address);
      };

      if (!walletAddress || !isValidEthereumAddress(walletAddress)) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Seller has not set a valid wallet address. Please ask the seller to add their crypto wallet in their profile.',
          success: false,
          data: {
            sellerId,
            walletAddress: walletAddress || null,
            isValid: false
          }
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        message: 'Seller wallet address retrieved successfully',
        success: true,
        data: {
          sellerId,
          walletAddress,
          sellerName: seller.fullName,
          isValid: true
        }
      });

    } catch (error) {
      console.error('Error getting seller wallet:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get seller wallet address',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Create crypto payment order
  public async createOrder(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 Received crypto order request:', req.body);
      
      const {
        jobberOrderId,
        buyerAddress,
        sellerAddress,
        usdAmount,
        chainId = 11155111, // Use Sepolia testnet instead of local
        gigTitle,
        description
      } = req.body;

      // Validation
      if (!buyerAddress || !sellerAddress || !usdAmount) {
        console.error('❌ Missing required fields:', { buyerAddress, sellerAddress, usdAmount });
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Missing required fields: buyerAddress, sellerAddress, usdAmount',
          success: false
        });
        return;
      }

      console.log('✅ Request validation passed');
      console.log('💰 Converting USD to ETH for amount:', usdAmount);

      // Convert USD to ETH
      const conversion = await PriceService.convertUSDToETH(parseFloat(usdAmount));
      
      // Calculate platform fee (same as Stripe: 5.5% + $2 if < $50)
      const serviceFee = parseFloat(usdAmount) < 50 
        ? (5.5 / 100) * parseFloat(usdAmount) + 2 
        : (5.5 / 100) * parseFloat(usdAmount);
      
      const serviceFeeETH = await PriceService.convertUSDToETH(serviceFee);

      const orderId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create order in smart contract first
      console.log('⛓️  Creating order in escrow contract...');
      console.log('📋 Contract parameters:', {
        orderId,
        buyerAddress: buyerAddress.toLowerCase(),
        sellerAddress: sellerAddress.toLowerCase(),
        ethAmount: conversion.ethAmount,
        chainId,
        autoRelease: true
      });
      
      const contractResult = await blockchainService.createOrderInContract(
        orderId,
        buyerAddress.toLowerCase(),
        sellerAddress.toLowerCase(),
        conversion.ethAmount,
        chainId,
        true // auto-release enabled
      );

      console.log('🔗 Contract result:', contractResult);

      if (!contractResult.success) {
        console.error('❌ Contract creation failed:', contractResult.error);
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Failed to create order in escrow contract',
          success: false,
          error: contractResult.error
        });
        return;
      }

      console.log('✅ Contract creation successful, TX:', contractResult.transactionHash);

      console.log('💾 Order created in contract, saving to database...');

      // Create order in database after successful contract creation
      const orderData = {
        orderId,
        jobberOrderId,
        buyerAddress: buyerAddress.toLowerCase(),
        sellerAddress: sellerAddress.toLowerCase(),
        tokenAddress: '0x0000000000000000000000000000000000000000', // ETH
        tokenSymbol: 'ETH',
        amount: conversion.ethAmount,
        usdAmount: conversion.usdAmount,
        platformFee: serviceFeeETH.ethAmount,
        platformFeeUSD: serviceFee,
        chainId,
        status: 'created',
        gigTitle: gigTitle || 'Gig Service',
        description: description || 'Service payment',
        contractCreationTx: contractResult.transactionHash, // Store contract creation tx
        priceData: {
          ethPriceUSD: conversion.ethPriceUSD,
          exchangeRate: conversion.exchangeRate,
          conversionTime: new Date()
        }
      };

      console.log('📊 Order data to save:', orderData);
      
      const cryptoOrder = new CryptoOrderModel(orderData);
      const savedOrder = await cryptoOrder.save();
      console.log('✅ Order saved successfully with ID:', savedOrder._id);

      res.status(StatusCodes.CREATED).json({
        message: 'Crypto order created successfully in both contract and database',
        success: true,
        data: {
          orderId: savedOrder.orderId,
          amount: savedOrder.amount,
          usdAmount: savedOrder.usdAmount,
          platformFee: savedOrder.platformFee,
          platformFeeUSD: savedOrder.platformFeeUSD,
          tokenSymbol: savedOrder.tokenSymbol,
          chainId: savedOrder.chainId,
          buyerAddress: savedOrder.buyerAddress,
          sellerAddress: savedOrder.sellerAddress,
          contractCreationTx: contractResult.transactionHash,
          priceData: savedOrder.priceData,
          status: savedOrder.status,
          escrowInfo: {
            contractAddress: config.ESCROW_CONTRACT_ADDRESS,
            autoRelease: true,
            createdInContract: true
          }
        }
      });

    } catch (error) {
      console.error('Error creating crypto order:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to create crypto order',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Process payment for crypto order
  public async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { transactionHash, blockNumber } = req.body;

      // Find order
      const order = await CryptoOrderModel.findOne({ orderId });
      if (!order) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: 'Order not found',
          success: false
        });
        return;
      }

      // Update order with transaction details
      order.transactionHash = transactionHash;
      order.blockNumber = blockNumber;
      order.status = 'paid';
      await order.save();

      // Verify transaction on blockchain
      const txDetails = await blockchainService.getTransactionDetails(
        transactionHash,
        order.chainId
      );

      res.status(StatusCodes.OK).json({
        message: 'Payment processed successfully',
        success: true,
        data: {
          orderId,
          transactionHash,
          blockNumber,
          status: 'paid',
          txDetails
        }
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to process payment',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Mark order as delivered
  public async markDelivered(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const order = await CryptoOrderModel.findOne({ orderId });
      if (!order) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: 'Order not found',
          success: false
        });
        return;
      }

      if (order.status !== 'paid') {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Order must be paid before marking as delivered',
          success: false
        });
        return;
      }

      console.log(`📦 Marking order ${orderId} as delivered in smart contract...`);

      // Mark as delivered in smart contract
      const blockchainResult = await blockchainService.markOrderDelivered(orderId, order.chainId);
      
      if (!blockchainResult.success) {
        console.error('❌ Failed to mark delivered in smart contract:', blockchainResult.error);
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Failed to mark delivered in smart contract',
          success: false,
          error: blockchainResult.error
        });
        return;
      }

      console.log(`✅ Order ${orderId} marked as delivered in contract, TX: ${blockchainResult.transactionHash}`);

      // Update database after successful blockchain transaction
      order.status = 'delivered';
      order.deliveredAt = new Date();
      await order.save();

      res.status(StatusCodes.OK).json({
        message: 'Order marked as delivered successfully',
        success: true,
        data: {
          orderId,
          status: 'delivered',
          deliveredAt: order.deliveredAt,
          transactionHash: blockchainResult.transactionHash,
          autoReleaseTime: '7 days from now'
        }
      });

    } catch (error) {
      console.error('Error marking order as delivered:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to mark order as delivered',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Complete order and release payment
  public async completeOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const order = await CryptoOrderModel.findOne({ orderId });
      if (!order) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: 'Order not found',
          success: false
        });
        return;
      }

      if (order.status !== 'delivered') {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Order must be delivered before completion',
          success: false
        });
        return;
      }

      console.log(`💰 Releasing payment for order ${orderId} from smart contract...`);

      // Release payment from smart contract (buyer approval)
      const blockchainResult = await blockchainService.approveOrderInContract(orderId, order.chainId);
      
      if (!blockchainResult.success) {
        console.error('❌ Failed to release payment from smart contract:', blockchainResult.error);
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Failed to release payment from smart contract',
          success: false,
          error: blockchainResult.error
        });
        return;
      }

      console.log(`✅ Payment released for order ${orderId}, TX: ${blockchainResult.transactionHash}`);

      // Calculate amounts
      const sellerAmount = parseFloat(order.amount) - parseFloat(order.platformFee);
      
      // Update database after successful blockchain transaction
      order.status = 'completed';
      order.completedAt = new Date();
      await order.save();

      res.status(StatusCodes.OK).json({
        message: 'Order completed successfully! Payment released to seller.',
        success: true,
        data: {
          orderId,
          status: 'completed',
          sellerAmount: sellerAmount.toString(),
          platformFee: order.platformFee,
          completedAt: order.completedAt,
          transactionHash: blockchainResult.transactionHash,
          note: 'ETH has been transferred to seller wallet'
        }
      });

    } catch (error) {
      console.error('Error completing order:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to complete order',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get order details
  public async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      const order = await CryptoOrderModel.findOne({ orderId });
      if (!order) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: 'Order not found',
          success: false
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        message: 'Order retrieved successfully',
        success: true,
        data: order
      });

    } catch (error) {
      console.error('Error getting order:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get order',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get orders by buyer
  public async getOrdersByBuyer(req: Request, res: Response): Promise<void> {
    try {
      const { buyerAddress } = req.params;
      const { status, limit = 10, offset = 0 } = req.query;

      const query: any = { buyerAddress: buyerAddress.toLowerCase() };
      if (status) {
        query.status = status;
      }

      const orders = await CryptoOrderModel.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string))
        .skip(parseInt(offset as string));

      const total = await CryptoOrderModel.countDocuments(query);

      res.status(StatusCodes.OK).json({
        message: 'Orders retrieved successfully',
        success: true,
        data: {
          orders,
          pagination: {
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            hasMore: total > parseInt(offset as string) + parseInt(limit as string)
          }
        }
      });

    } catch (error) {
      console.error('Error getting orders by buyer:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get orders',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get supported tokens
  public async getSupportedTokens(req: Request, res: Response): Promise<void> {
    try {
      const supportedChains = [1, 11155111, 1337]; // Mainnet, Sepolia, Local
             // For now, return ETH only for all supported chains
       const chainTokens = supportedChains.reduce((acc, chainId) => {
         acc[chainId] = [{
           address: '0x0000000000000000000000000000000000000000',
           symbol: 'ETH',
           decimals: 18,
           name: 'Ethereum'
         }];
         return acc;
       }, {} as Record<number, any[]>);

        res.status(StatusCodes.OK).json({
          message: 'Supported tokens retrieved successfully',
          success: true,
          data: {
          supportedChains,
          tokens: chainTokens,
          defaultChain: 1337 // Local development
        }
      });
    } catch (error) {
      console.error('Error getting supported tokens:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get supported tokens',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get ETH price and convert USD amount
  public async getETHPrice(req: Request, res: Response): Promise<void> {
    try {
      const { usdAmount } = req.query;
      
      if (!usdAmount) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'USD amount is required',
          success: false
        });
        return;
      }

      const conversion = await PriceService.convertUSDToETH(parseFloat(usdAmount as string));
      
      res.status(StatusCodes.OK).json({
        message: 'Price conversion retrieved successfully',
        success: true,
        data: conversion
      });
    } catch (error) {
      console.error('Error getting ETH price:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get ETH price',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get wallet balance
  public async getWalletBalance(req: Request, res: Response): Promise<void> {
    try {
      const { address, chainId, tokenAddress } = req.query;

      if (!address || !chainId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Address and chainId are required',
          success: false
        });
        return;
      }

      let balance: string;
      if (tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000') {
        balance = await blockchainService.getTokenBalance(
          address as string,
          tokenAddress as string,
          Number(chainId)
        );
      } else {
        balance = await blockchainService.getNativeBalance(
          address as string,
          Number(chainId)
        );
      }

      res.status(StatusCodes.OK).json({
        message: 'Balance retrieved successfully',
        success: true,
        data: {
          address,
          chainId: Number(chainId),
          tokenAddress: tokenAddress || 'native',
          balance
        }
      });

    } catch (error) {
      console.error('Error getting wallet balance:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get wallet balance',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get wallet balance
  public async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const { address, chainId } = req.params;

      const balance = await blockchainService.getNativeBalance(
        address,
        parseInt(chainId)
      );

      res.status(StatusCodes.OK).json({
        message: 'Balance retrieved successfully',
        success: true,
        data: {
          address,
          chainId: parseInt(chainId),
          balance
        }
      });

    } catch (error) {
      console.error('Error getting balance:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get balance',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get transaction details
  public async getTransactionDetails(req: Request, res: Response): Promise<void> {
    try {
      const { txHash, chainId } = req.params;

      const txDetails = await blockchainService.getTransactionDetails(
        txHash,
        parseInt(chainId)
      );

      res.status(StatusCodes.OK).json({
        message: 'Transaction details retrieved successfully',
        success: true,
        data: txDetails
      });

    } catch (error) {
      console.error('Error getting transaction details:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get transaction details',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update order status
  public async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { status, transactionHash, blockNumber } = req.body;

      const order = await CryptoOrderModel.findOne({ orderId });
      if (!order) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: 'Order not found',
          success: false
        });
        return;
      }

      // Update order
      order.status = status;
      if (transactionHash) order.transactionHash = transactionHash;
      if (blockNumber) order.blockNumber = blockNumber;
      
      if (status === 'delivered') {
        order.deliveredAt = new Date();
      } else if (status === 'completed') {
        order.completedAt = new Date();
      }

      await order.save();

      res.status(StatusCodes.OK).json({
        message: 'Order status updated successfully',
        success: true,
        data: order
      });

    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to update order status',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 