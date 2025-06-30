import { CryptoOrderModel, ICryptoOrder } from '../../src/models/crypto-order.model';

describe('CryptoOrder Model', () => {
  let sampleOrderData: Partial<ICryptoOrder>;

  beforeEach(() => {
    sampleOrderData = {
      orderId: 'crypto_test_123',
      jobberOrderId: 'jobber_456',
      buyer: '0x1234567890123456789012345678901234567890',
      seller: '0x9876543210987654321098765432109876543210',
      tokenAddress: '0xA0b86a33E6441E2D16e1E8EaD8E2bb0b7D7F6E29',
      tokenSymbol: 'USDC',
      amount: '100.00',
      platformFee: '20.00',
      chainId: 137,
      autoRelease: false
    };
  });

  describe('Model Validation', () => {
    it('should create a valid crypto order', async () => {
      const order = new CryptoOrderModel(sampleOrderData);
      const validationError = order.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should require orderId', async () => {
      delete sampleOrderData.orderId;
      const order = new CryptoOrderModel(sampleOrderData);
      const validationError = order.validateSync();
      expect(validationError?.errors.orderId).toBeDefined();
    });

    it('should require jobberOrderId', async () => {
      delete sampleOrderData.jobberOrderId;
      const order = new CryptoOrderModel(sampleOrderData);
      const validationError = order.validateSync();
      expect(validationError?.errors.jobberOrderId).toBeDefined();
    });

    it('should require buyer address', async () => {
      delete sampleOrderData.buyer;
      const order = new CryptoOrderModel(sampleOrderData);
      const validationError = order.validateSync();
      expect(validationError?.errors.buyer).toBeDefined();
    });

    it('should require seller address', async () => {
      delete sampleOrderData.seller;
      const order = new CryptoOrderModel(sampleOrderData);
      const validationError = order.validateSync();
      expect(validationError?.errors.seller).toBeDefined();
    });

    it('should set default status to created', () => {
      const order = new CryptoOrderModel(sampleOrderData);
      expect(order.status).toBe('created');
    });

    it('should set default autoRelease to false', () => {
      const order = new CryptoOrderModel(sampleOrderData);
      expect(order.autoRelease).toBe(false);
    });

    it('should set default confirmations to 0', () => {
      const order = new CryptoOrderModel(sampleOrderData);
      expect(order.confirmations).toBe(0);
    });

    it('should validate status enum values', () => {
      const validStatuses = ['created', 'paid', 'delivered', 'completed', 'disputed', 'cancelled', 'refunded'];
      
      validStatuses.forEach(status => {
        const order = new CryptoOrderModel({ ...sampleOrderData, status });
        const validationError = order.validateSync();
        expect(validationError).toBeUndefined();
      });
    });

    it('should reject invalid status', () => {
      const order = new CryptoOrderModel({ ...sampleOrderData, status: 'invalid_status' as any });
      const validationError = order.validateSync();
      expect(validationError?.errors.status).toBeDefined();
    });

    it('should allow optional transactionHash', () => {
      const orderWithTx = new CryptoOrderModel({ 
        ...sampleOrderData, 
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' 
      });
      const validationError = orderWithTx.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should allow optional blockNumber', () => {
      const orderWithBlock = new CryptoOrderModel({ 
        ...sampleOrderData, 
        blockNumber: 12345678 
      });
      const validationError = orderWithBlock.validateSync();
      expect(validationError).toBeUndefined();
    });
  });

  describe('Model Properties', () => {
    // TODO: Add database integration test for timestamps when setting up test DB

    it('should generate unique orderId', () => {
      const order1 = new CryptoOrderModel({ ...sampleOrderData, orderId: 'test_1' });
      const order2 = new CryptoOrderModel({ ...sampleOrderData, orderId: 'test_2' });
      expect(order1.orderId).not.toBe(order2.orderId);
    });
  });
}); 