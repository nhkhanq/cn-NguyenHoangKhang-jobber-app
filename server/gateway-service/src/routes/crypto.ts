import { CryptoController } from '@gateway/controllers/crypto/crypto'
import express, { Router } from 'express'

class CryptoRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    // Token and price routes
    this.router.get('/crypto/tokens', CryptoController.prototype.getSupportedTokens)
    this.router.get('/crypto/price', CryptoController.prototype.getETHPrice)

    // Seller wallet route
    this.router.get('/crypto/sellers/:sellerId/wallet', CryptoController.prototype.getSellerWallet)
    
    // Crypto order management routes  
    this.router.post('/crypto/orders', CryptoController.prototype.createOrder)
    this.router.get('/crypto/orders/:orderId', CryptoController.prototype.getOrder)

    // Payment processing routes
    this.router.post('/crypto/orders/:orderId/payment', CryptoController.prototype.processPayment)
    this.router.put('/crypto/orders/:orderId/status', CryptoController.prototype.updateOrderStatus)
    this.router.put('/crypto/orders/:orderId/complete', CryptoController.prototype.completeOrder)
    
    // Balance and utility routes
    this.router.get('/crypto/balance/:address/:chainId', CryptoController.prototype.getBalance)
    this.router.get('/crypto/transaction/:txHash/:chainId', CryptoController.prototype.getTransactionDetails)
    this.router.get('/crypto/buyers/:buyerAddress/orders', CryptoController.prototype.getOrdersByBuyer)

    return this.router
  }
}

export const cryptoRoutes: CryptoRoutes = new CryptoRoutes() 