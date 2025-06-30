import { Router } from 'express';
import { CryptoPaymentController } from '../controllers/crypto-payment.controller';

const router = Router();
const cryptoPaymentController = new CryptoPaymentController();

// Order management routes
router.post('/orders', cryptoPaymentController.createOrder.bind(cryptoPaymentController));
router.get('/orders/:orderId', cryptoPaymentController.getOrder.bind(cryptoPaymentController));
router.post('/orders/:orderId/payment', cryptoPaymentController.processPayment.bind(cryptoPaymentController));
router.post('/orders/:orderId/delivered', cryptoPaymentController.markDelivered.bind(cryptoPaymentController));
router.post('/orders/:orderId/complete', cryptoPaymentController.completeOrder.bind(cryptoPaymentController));

// User order queries
router.get('/buyers/:buyerAddress/orders', cryptoPaymentController.getOrdersByBuyer.bind(cryptoPaymentController));

// Blockchain utilities
router.get('/tokens', cryptoPaymentController.getSupportedTokens.bind(cryptoPaymentController));
router.get('/balance', cryptoPaymentController.getWalletBalance.bind(cryptoPaymentController));

export default router; 