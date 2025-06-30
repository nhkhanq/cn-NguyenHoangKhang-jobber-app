import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { OrderModel } from '@order/models/order.schema'
import { cryptoService } from '@order/service/crypto.service'

// Create crypto order (integrated with regular order creation)
export const createCryptoOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body

    // 1. Create regular Jobber order with crypto payment type
    const order = new OrderModel({
      ...orderData,
      paymentType: 'crypto',
      status: 'pending_crypto_payment',
      cryptoPayment: {
        tokenAddress: orderData.cryptoPayment?.tokenAddress,
        tokenSymbol: orderData.cryptoPayment?.tokenSymbol,
        buyerWallet: orderData.cryptoPayment?.buyerWallet,
        sellerWallet: orderData.cryptoPayment?.sellerWallet,
        chainId: orderData.cryptoPayment?.chainId,
        status: 'pending'
      }
    })

    const savedOrder = await order.save()

    // 2. Call crypto-payment-service to create crypto order
    try {
      const cryptoOrderData = {
        jobberOrderId: savedOrder.orderId,
        buyerAddress: orderData.cryptoPayment?.buyerWallet,
        sellerAddress: orderData.cryptoPayment?.sellerWallet,
        tokenAddress: orderData.cryptoPayment?.tokenAddress,
        tokenSymbol: orderData.cryptoPayment?.tokenSymbol,
        amount: savedOrder.price.toString(),
        chainId: orderData.cryptoPayment?.chainId,
        gigTitle: savedOrder.gigMainTitle,
        description: savedOrder.gigBasicDescription
      }

      const cryptoResponse = await cryptoService.createCryptoOrder(cryptoOrderData)

      // 3. Update order with crypto order ID
      ;(savedOrder as any).cryptoPayment.cryptoOrderId = cryptoResponse.cryptoOrder?.orderId || cryptoResponse.orderId
      await savedOrder.save()

      res.status(StatusCodes.CREATED).json({
        message: 'Crypto order created successfully',
        order: savedOrder,
        cryptoOrder: cryptoResponse.cryptoOrder || cryptoResponse
      })
    } catch (cryptoError) {
      // If crypto service fails, rollback the order
      await OrderModel.deleteOne({ _id: savedOrder._id })
      throw cryptoError
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating crypto order',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Confirm crypto payment
export const confirmCryptoPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { transactionHash, blockNumber } = req.body

    // 1. Find order
    const order = await OrderModel.findOne({ orderId })
    if (!order || (order as any).paymentType !== 'crypto') {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'Crypto order not found'
      })
      return
    }

    // 2. Confirm payment in crypto service
    if ((order as any).cryptoPayment?.cryptoOrderId) {
      await cryptoService.confirmCryptoPayment((order as any).cryptoPayment.cryptoOrderId, {
        transactionHash,
        blockNumber
      })
    }

    // 3. Update order status
    order.status = 'in_progress'
    ;(order as any).cryptoPayment.status = 'confirmed'
    ;(order as any).cryptoPayment.transactionHash = transactionHash
    ;(order as any).cryptoPayment.blockNumber = blockNumber
    
    if (order.events) {
      order.events.placeOrder = new Date().toISOString()
    }

    await order.save()

    res.status(StatusCodes.OK).json({
      message: 'Crypto payment confirmed successfully',
      order
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error confirming crypto payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Deliver crypto order
export const deliverCryptoOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const deliveryData = req.body

    // 1. Find and update order
    const order = await OrderModel.findOne({ orderId })
    if (!order || (order as any).paymentType !== 'crypto') {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'Crypto order not found'
      })
      return
    }

    // 2. Mark as delivered in crypto service
    if ((order as any).cryptoPayment?.cryptoOrderId) {
      await cryptoService.markCryptoOrderDelivered((order as any).cryptoPayment.cryptoOrderId, deliveryData)
    }

    // 3. Update order
    order.delivered = true
    order.status = 'delivered'
    
    if (order.events) {
      order.events.orderDelivered = new Date().toISOString()
    }
    
    order.deliveredWork = deliveryData.deliveredWork || []

    await order.save()

    res.status(StatusCodes.OK).json({
      message: 'Crypto order delivered successfully',
      order
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error delivering crypto order',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Complete crypto order (buyer approval)
export const completeCryptoOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params

    // 1. Find order
    const order = await OrderModel.findOne({ orderId })
    if (!order || (order as any).paymentType !== 'crypto') {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'Crypto order not found'
      })
      return
    }

    // 2. Complete in crypto service (release funds from escrow)
    if ((order as any).cryptoPayment?.cryptoOrderId) {
      await cryptoService.completeCryptoOrder((order as any).cryptoPayment.cryptoOrderId)
    }

    // 3. Update order
    order.approved = true
    order.status = 'completed'
    ;(order as any).approvedAt = new Date()
    ;(order as any).cryptoPayment.status = 'completed'

    await order.save()

    res.status(StatusCodes.OK).json({
      message: 'Crypto order completed successfully',
      order
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error completing crypto order',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Cancel crypto order
export const cancelCryptoOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params
    const { reason } = req.body

    // 1. Find order
    const order = await OrderModel.findOne({ orderId })
    if (!order || (order as any).paymentType !== 'crypto') {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'Crypto order not found'
      })
      return
    }

    // 2. Cancel in crypto service
    if ((order as any).cryptoPayment?.cryptoOrderId) {
      await cryptoService.cancelCryptoOrder((order as any).cryptoPayment.cryptoOrderId, reason)
    }

    // 3. Update order
    order.cancelled = true
    order.status = 'cancelled'
    
    if (order.offer) {
      order.offer.cancelled = true
      order.offer.reason = reason
    }
    
    ;(order as any).cryptoPayment.status = 'failed'

    await order.save()

    res.status(StatusCodes.OK).json({
      message: 'Crypto order cancelled successfully',
      order
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error cancelling crypto order',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 