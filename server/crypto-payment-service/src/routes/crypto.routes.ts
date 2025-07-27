import { Router } from 'express';
import { CryptoPaymentController } from '../controllers/crypto-payment.controller';

const router = Router();
const cryptoPaymentController = new CryptoPaymentController();

// Token and price routes
router.get('/tokens', cryptoPaymentController.getSupportedTokens.bind(cryptoPaymentController));
router.get('/price', cryptoPaymentController.getETHPrice.bind(cryptoPaymentController));

// Seller wallet route
router.get('/sellers/:sellerId/wallet', cryptoPaymentController.getSellerWallet.bind(cryptoPaymentController));

// Order management routes
router.post('/orders', cryptoPaymentController.createOrder.bind(cryptoPaymentController));
router.get('/orders/:orderId', cryptoPaymentController.getOrder.bind(cryptoPaymentController));

// Payment processing routes
router.post('/orders/:orderId/payment', cryptoPaymentController.processPayment.bind(cryptoPaymentController));
router.put('/orders/:orderId/status', cryptoPaymentController.updateOrderStatus.bind(cryptoPaymentController));
router.put('/orders/:orderId/complete', cryptoPaymentController.completeOrder.bind(cryptoPaymentController));

// User order queries
router.get('/buyers/:buyerAddress/orders', cryptoPaymentController.getOrdersByBuyer.bind(cryptoPaymentController));

// Balance and transaction routes
router.get('/balance/:address/:chainId', cryptoPaymentController.getBalance.bind(cryptoPaymentController));
router.get('/transaction/:txHash/:chainId', cryptoPaymentController.getTransactionDetails.bind(cryptoPaymentController));

export default router; 