import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { OrderModel } from '@order/models/order.schema'
import { cryptoService } from '@order/service/crypto.service'
import { publishDirectMessage } from '@order/queues/order.producer'
import { orderChannel } from '@order/server'
import { sendNotification } from '@order/service/notification.service'
import { config } from '@order/config'
import { IOrderMessage, lowerCase } from 'jobber-shared-for-hkhanq'

// Create crypto order (integrated with regular order creation)
export const createCryptoOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔥 Creating crypto order with request data:', JSON.stringify(req.body, null, 2));
    
    const requestData = req.body
    const orderId = `JO${Date.now()}${Math.floor(Math.random() * 10000)}`
    const invoiceId = `JI${Date.now()}${Math.floor(Math.random() * 10000)}`

    // 1. Create full order data (like Stripe orders)
    const orderData = {
      offer: {
        gigTitle: requestData.offer?.gigTitle || requestData.gigTitle,
        price: requestData.offer?.price || requestData.usdAmount - (requestData.serviceFee || 0),
        description: requestData.offer?.description || requestData.description,
        deliveryInDays: requestData.offer?.deliveryInDays || 7,
        oldDeliveryDate: requestData.offer?.oldDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        newDeliveryDate: requestData.offer?.newDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accepted: true,
        cancelled: requestData.offer?.cancelled || false
      },
      gigId: requestData.gigId,
      sellerId: requestData.sellerId,
      sellerImage: requestData.sellerImage,
      sellerUsername: requestData.sellerUsername,
      sellerEmail: requestData.sellerEmail,
      gigCoverImage: requestData.gigCoverImage,
      gigMainTitle: requestData.gigMainTitle,
      gigBasicTitle: requestData.gigBasicTitle,
      gigBasicDescription: requestData.gigBasicDescription,
      buyerId: requestData.buyerId,
      buyerUsername: requestData.buyerUsername,
      buyerImage: requestData.buyerImage,
      buyerEmail: requestData.buyerEmail,
      status: 'pending_crypto_payment',
      orderId,
      invoiceId,
      quantity: 1,
      dateOrdered: new Date().toISOString(),
      price: requestData.offer?.price || requestData.usdAmount - (requestData.serviceFee || 0),
      serviceFee: requestData.serviceFee || 0,
      requirements: '',
      paymentType: 'crypto',
      events: {
        placeOrder: new Date().toISOString(),
        requirements: new Date().toISOString(),
        orderStarted: new Date().toISOString()
      },
      cryptoPayment: {
        tokenAddress: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH Sepolia
        tokenSymbol: 'WETH',
        buyerWallet: requestData.buyerAddress,
        sellerWallet: requestData.sellerAddress,
        chainId: requestData.chainId,
        status: 'pending'
      }
    }

    // 2. Create regular Jobber order with crypto payment type
    console.log('📋 Order data to save:', JSON.stringify(orderData, null, 2));
    
    const order = new OrderModel(orderData)

    console.log('💾 Saving order to database...');
    const savedOrder = await order.save()
    console.log('✅ Order saved successfully:', savedOrder.orderId);

    // 3. Call crypto-payment-service to create crypto order
    try {
      const cryptoOrderData = {
        jobberOrderId: savedOrder.orderId,
        buyerAddress: (savedOrder as any).cryptoPayment.buyerWallet,
        sellerAddress: (savedOrder as any).cryptoPayment.sellerWallet,
        usdAmount: savedOrder.price + (savedOrder.serviceFee || 0), // Total USD amount
        chainId: (savedOrder as any).cryptoPayment.chainId,
        gigTitle: savedOrder.gigMainTitle,
        description: savedOrder.gigBasicDescription
      }

      const cryptoResponse = await cryptoService.createCryptoOrder(cryptoOrderData)

      // 4. Update order with crypto order ID
      ;(savedOrder as any).cryptoPayment.cryptoOrderId = cryptoResponse.cryptoOrder?.orderId || cryptoResponse.orderId
      await savedOrder.save()

      // 5. Send notifications (like Stripe payment)
      const messageDetails: IOrderMessage = {
        sellerId: savedOrder.sellerId,
        ongoingJobs: 1,
        type: 'create-order'
      }
      
      // Update seller info
      await publishDirectMessage(
        orderChannel,
        'jobber-seller-update',
        'user-seller',
        JSON.stringify(messageDetails),
        'Crypto order details sent to users service'
      )
      
      // Send order placed email notification
      const emailMessageDetails: IOrderMessage = {
        orderId: savedOrder.orderId,
        invoiceId: savedOrder.invoiceId || 'N/A',
        orderDue: `${savedOrder.offer.newDeliveryDate}`,
        amount: `${savedOrder.price}`,
        buyerUsername: lowerCase(savedOrder.buyerUsername),
        sellerUsername: lowerCase(savedOrder.sellerUsername),
        title: savedOrder.offer.gigTitle,
        description: savedOrder.offer.description,
        requirements: savedOrder.requirements,
        serviceFee: `${savedOrder.serviceFee}`,
        total: `${savedOrder.price + (savedOrder.serviceFee || 0)}`,
        orderUrl: `${config.CLIENT_URL}/orders/${savedOrder.orderId}/activities`,
        template: 'orderPlaced'
      }
      
      // Send email notification
      await publishDirectMessage(
        orderChannel,
        'jobber-order-notification',
        'order-email',
        JSON.stringify(emailMessageDetails),
        'Crypto order email sent to notification service.'
      )
      
      // Send in-app notification to seller
      sendNotification(savedOrder, savedOrder.sellerUsername, 'placed a crypto order for your gig.')

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
    console.error('❌ Error creating crypto order:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
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

    // 4. Send payment confirmation notification
    sendNotification(order, order.sellerUsername, 'confirmed crypto payment for your order.')

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

    // 4. Send delivery notifications (like Stripe payment)
    const messageDetails: IOrderMessage = {
      orderId,
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      title: order.offer.gigTitle,
      description: order.offer.description,
      orderUrl: `${config.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderDelivered'
    }
    
    // Send delivery email notification
    await publishDirectMessage(
      orderChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Crypto order delivered message sent to notification service.'
    )
    
    // Send in-app notification to buyer
    sendNotification(order, order.buyerUsername, 'delivered your crypto order.')

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
    const { buyerId, sellerId, ongoingJobs, completedJobs, totalEarnings, purchasedGigs } = req.body

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

    // 4. Send completion notifications (like Stripe payment)
    const messageDetails: IOrderMessage = {
      sellerId: sellerId || order.sellerId,
      buyerId: buyerId || order.buyerId,
      ongoingJobs: ongoingJobs || 0,
      completedJobs: completedJobs || 1,
      totalEarnings: totalEarnings || order.price,
      recentDelivery: `${new Date()}`,
      type: 'approve-order'
    }
    
    // Update seller info
    await publishDirectMessage(
      orderChannel,
      'jobber-seller-update',
      'user-seller',
      JSON.stringify(messageDetails),
      'Approved crypto order details sent to users service.'
    )
    
    // Update buyer info
    await publishDirectMessage(
      orderChannel,
      'jobber-buyer-update',
      'user-buyer',
      JSON.stringify({ 
        type: 'purchased-gigs', 
        buyerId: buyerId || order.buyerId, 
        purchasedGigs: purchasedGigs || 1 
      }),
      'Approved crypto order details sent to users service.'
    )
    
    // Send in-app notification to seller
    sendNotification(order, order.sellerUsername, 'approved your crypto order delivery.')

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
    const { reason, buyerId, sellerId, purchasedGigs } = req.body

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
    ;(order as any).cryptoPayment.status = 'cancelled'
    
    if (order.offer) {
      order.offer.cancelled = true
      order.offer.reason = reason || 'Order cancelled'
    }

    await order.save()

    // 4. Send cancellation notifications (like Stripe payment)
    // Update seller info
    await publishDirectMessage(
      orderChannel,
      'jobber-seller-update',
      'user-seller',
      JSON.stringify({ 
        type: 'cancel-order', 
        sellerId: sellerId || order.sellerId 
      }),
      'Cancelled crypto order details sent to users service.'
    )
    
    // Update buyer info
    await publishDirectMessage(
      orderChannel,
      'jobber-buyer-update',
      'user-buyer',
      JSON.stringify({ 
        type: 'cancel-order', 
        buyerId: buyerId || order.buyerId, 
        purchasedGigs: purchasedGigs || 0 
      }),
      'Cancelled crypto order details sent to users service.'
    )
    
    // Send in-app notification to seller
    sendNotification(order, order.sellerUsername, 'cancelled your crypto order delivery.')

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