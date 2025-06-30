import { Create } from '@gateway/controllers/crypto/create'
import { Get } from '@gateway/controllers/crypto/get'
import { Update } from '@gateway/controllers/crypto/update'
import express, { Router } from 'express'

class CryptoRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    // Create operations
    this.router.post('/crypto/orders', Create.prototype.cryptoOrder)

    // Get operations - Utility endpoints
    this.router.get('/crypto/tokens', Get.prototype.supportedTokens)
    this.router.get('/crypto/balance/:walletAddress/:chainId', Get.prototype.walletBalance)

    // Get operations - Order queries
    this.router.get('/crypto/orders/:orderId', Get.prototype.cryptoOrder)
    this.router.get('/crypto/orders/jobber/:jobberOrderId', Get.prototype.cryptoOrdersByJobberOrderId)
    this.router.get('/crypto/orders/buyer/:buyerAddress', Get.prototype.buyerOrders)
    this.router.get('/crypto/orders/seller/:sellerAddress', Get.prototype.sellerOrders)

    // Update operations - Order lifecycle
    this.router.put('/crypto/orders/:orderId/confirm-payment', Update.prototype.confirmPayment)
    this.router.put('/crypto/orders/:orderId/delivered', Update.prototype.markDelivered)
    this.router.put('/crypto/orders/:orderId/complete', Update.prototype.completeOrder)
    this.router.put('/crypto/orders/:orderId/cancel', Update.prototype.cancelOrder)

    // Update operations - Dispute management  
    this.router.put('/crypto/orders/:orderId/dispute', Update.prototype.raiseDispute)
    this.router.put('/crypto/orders/:orderId/resolve-dispute', Update.prototype.resolveDispute)

    return this.router
  }
}

export const cryptoRoutes: CryptoRoutes = new CryptoRoutes() 