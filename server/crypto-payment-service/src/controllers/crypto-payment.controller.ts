import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { blockchainService } from '../services/blockchain.service';
import { CryptoOrderModel } from '../models/crypto-order.model';

export class CryptoPaymentController {
  
  // Create crypto payment order
  public async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        jobberOrderId,
        buyerAddress,
        sellerAddress,
        tokenAddress,
        tokenSymbol,
        amount,
        chainId,
        autoRelease
      } = req.body;

      // Validate addresses
      if (!blockchainService.isValidAddress(buyerAddress)) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid buyer address',
          success: false
        });
        return;
      }

      if (!blockchainService.isValidAddress(sellerAddress)) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid seller address',
          success: false
        });
        return;
      }

      // Generate unique order ID
      const orderId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate platform fee (20%)
      const platformFeePercentage = 0.2;
      const platformFee = (parseFloat(amount) * platformFeePercentage).toString();

      // Create order in database
      const cryptoOrder = new CryptoOrderModel({
        orderId,
        jobberOrderId,
        buyer: buyerAddress,
        seller: sellerAddress,
        tokenAddress,
        tokenSymbol,
        amount,
        platformFee,
        chainId,
        status: 'created',
        autoRelease: autoRelease || false
      });

      await cryptoOrder.save();

      res.status(StatusCodes.CREATED).json({
        message: 'Crypto order created successfully',
        success: true,
        data: {
          orderId,
          jobberOrderId,
          buyerAddress,
          sellerAddress,
          tokenAddress,
          tokenSymbol,
          amount,
          platformFee,
          chainId,
          autoRelease,
          status: 'created'
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

      order.status = 'delivered';
      if (order.autoRelease) {
        // Set auto-release time (7 days from now)
        const releaseTime = new Date();
        releaseTime.setDate(releaseTime.getDate() + 7);
        order.releaseTime = releaseTime;
      }
      await order.save();

      res.status(StatusCodes.OK).json({
        message: 'Order marked as delivered',
        success: true,
        data: {
          orderId,
          status: 'delivered',
          autoRelease: order.autoRelease,
          releaseTime: order.releaseTime
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

      // Process payment release on blockchain
      const sellerAmount = parseFloat(order.amount) - parseFloat(order.platformFee);
      
      // In real implementation, this would call smart contract
      // For now, just update the database
      order.status = 'completed';
      order.completedAt = new Date();
      await order.save();

      res.status(StatusCodes.OK).json({
        message: 'Order completed successfully',
        success: true,
        data: {
          orderId,
          status: 'completed',
          sellerAmount: sellerAmount.toString(),
          platformFee: order.platformFee,
          completedAt: order.completedAt
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
      const { status, page = 1, limit = 10 } = req.query;

      const query: any = { buyer: buyerAddress };
      if (status) query.status = status;

      const orders = await CryptoOrderModel.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await CryptoOrderModel.countDocuments(query);

      res.status(StatusCodes.OK).json({
        message: 'Orders retrieved successfully',
        success: true,
        data: {
          orders,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
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
      const { chainId } = req.query;

      if (chainId) {
        const tokens = blockchainService.getSupportedTokens(Number(chainId));
        const tokenArray = Array.from(tokens.entries()).map(([symbol, info]) => ({
          ...info
        }));

        res.status(StatusCodes.OK).json({
          message: 'Supported tokens retrieved successfully',
          success: true,
          data: {
            chainId: Number(chainId),
            tokens: tokenArray
          }
        });
      } else {
        // Return all supported tokens for all chains
        const allTokens = {
          ethereum: Array.from(blockchainService.getSupportedTokens(1).entries()),
          polygon: Array.from(blockchainService.getSupportedTokens(137).entries()),
          bsc: Array.from(blockchainService.getSupportedTokens(56).entries())
        };

        res.status(StatusCodes.OK).json({
          message: 'All supported tokens retrieved successfully',
          success: true,
          data: allTokens
        });
      }

    } catch (error) {
      console.error('Error getting supported tokens:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to get supported tokens',
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
} 