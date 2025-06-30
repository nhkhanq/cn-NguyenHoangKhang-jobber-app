# 🔗 Crypto Payment Service - Integration Plan

## 📊 **Feasibility Assessment: ✅ HIGHLY FEASIBLE**

### **Why it's feasible:**

- ✅ **Microservices Architecture** - Fits perfectly into existing pattern
- ✅ **Similar Tech Stack** - Express.js, MongoDB, TypeScript
- ✅ **Gateway Pattern** - Already established in gateway-service
- ✅ **Order Extension** - Can extend existing order.schema.ts
- ✅ **Authentication** - Reuse existing auth middleware

---

## 🎯 **INTEGRATION ROADMAP**

### **Phase 1: Core Integration (Week 1-2)**

#### **1.1 Gateway Service Integration**

**Add crypto routes to gateway:**

```typescript
// server/gateway-service/src/routes/crypto.ts
import { CryptoRoutes } from "@gateway/controllers/crypto";

class CryptoRoutes {
  public routes(): Router {
    // Crypto order management
    this.router.post("/crypto/orders", Create.prototype.cryptoOrder);
    this.router.post(
      "/crypto/orders/:orderId/payment",
      Update.prototype.processPayment
    );
    this.router.put(
      "/crypto/orders/:orderId/delivered",
      Update.prototype.markDelivered
    );
    this.router.put(
      "/crypto/orders/:orderId/complete",
      Update.prototype.completeOrder
    );

    // Wallet & blockchain utilities
    this.router.get("/crypto/tokens", Get.prototype.supportedTokens);
    this.router.get("/crypto/balance", Get.prototype.walletBalance);

    return this.router;
  }
}
```

**Add to main routes:**

```typescript
// server/gateway-service/src/routes.ts
import { cryptoRoutes } from "@gateway/routes/crypto";

export const appRoutes = (app: Application) => {
  // ... existing routes
  app.use(BASE_PATH, authMiddleware.verifyUser, cryptoRoutes.routes()); // ✅ ADD THIS
};
```

#### **1.2 Gateway Controllers**

```typescript
// server/gateway-service/src/controllers/crypto/create.ts
export class Create {
  public async cryptoOrder(req: Request, res: Response): Promise<void> {
    const response = await cryptoService.createOrder(req.body);
    res.status(StatusCodes.CREATED).json(response.data);
  }
}
```

#### **1.3 Gateway Service Client**

```typescript
// server/gateway-service/src/services/api/crypto.service.ts
class CryptoService {
  constructor() {
    const axiosService = new AxiosService(
      `${process.env.CRYPTO_PAYMENT_BASE_URL}/api/v1/crypto`,
      "crypto"
    );
    this.axiosInstance = axiosService.axios;
  }

  async createOrder(body: any): Promise<AxiosResponse> {
    return await this.axiosInstance.post("/orders", body);
  }

  // ... other methods
}
```

---

### **Phase 2: Order Service Integration (Week 2-3)**

#### **2.1 Extend Order Schema**

```typescript
// server/order-service/src/models/order.schema.ts
const orderSchema: Schema = new Schema({
  // ... existing fields

  // ✅ ADD CRYPTO PAYMENT FIELDS
  paymentType: {
    type: String,
    enum: ["stripe", "crypto"],
    default: "stripe",
  },
  cryptoPayment: {
    cryptoOrderId: { type: String }, // Reference to crypto-payment-service
    tokenAddress: { type: String },
    tokenSymbol: { type: String },
    buyerWallet: { type: String },
    sellerWallet: { type: String },
    chainId: { type: Number },
    transactionHash: { type: String },
    blockNumber: { type: Number },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "failed"],
    },
  },
});
```

#### **2.2 Order Service Routes**

```typescript
// server/order-service/src/routes/order.ts
const orderRoutes = (): Router => {
  // ... existing routes

  // ✅ ADD CRYPTO ROUTES
  router.post("/crypto", cryptoOrder); // Create crypto order
  router.put("/crypto/:orderId/confirm", confirmCryptoPayment);
  router.get("/crypto/:cryptoOrderId", getCryptoOrder);

  return router;
};
```

#### **2.3 Order Controllers for Crypto**

```typescript
// server/order-service/src/controllers/order/crypto.ts
export const cryptoOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Create regular Jobber order
    const order = await OrderModel.create({
      ...req.body,
      paymentType: "crypto",
      status: "pending_crypto_payment",
    });

    // 2. Call crypto-payment-service to create crypto order
    const cryptoResponse = await axios.post(
      `${config.CRYPTO_PAYMENT_BASE_URL}/api/v1/crypto/orders`,
      {
        jobberOrderId: order.orderId,
        buyerAddress: req.body.buyerWallet,
        sellerAddress: req.body.sellerWallet,
        tokenAddress: req.body.tokenAddress,
        tokenSymbol: req.body.tokenSymbol,
        amount: order.price.toString(),
        chainId: req.body.chainId,
      }
    );

    // 3. Update order with crypto details
    order.cryptoPayment = {
      cryptoOrderId: cryptoResponse.data.data.orderId,
      ...req.body.cryptoPayment,
    };
    await order.save();

    res.status(StatusCodes.CREATED).json({
      message: "Crypto order created successfully",
      order,
      cryptoOrder: cryptoResponse.data.data,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
```

---

### **Phase 3: Frontend Integration (Week 3-4)**

#### **3.1 Crypto Payment Components**

```typescript
// jobber-client/src/features/order/components/CryptoPayment.tsx
interface CryptoPaymentProps {
  order: IOrderDocument
  onPaymentComplete: (txHash: string) => void
}

export const CryptoPayment: FC<CryptoPaymentProps> = ({ order, onPaymentComplete }) => {
  const [supportedTokens, setSupportedTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState('')
  const [walletConnected, setWalletConnected] = useState(false)

  const connectWallet = async () => {
    // MetaMask integration
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      setWalletConnected(true)
    }
  }

  const payWithCrypto = async () => {
    try {
      // 1. Create crypto order
      const response = await orderApi.createCryptoOrder({
        ...order,
        cryptoPayment: {
          tokenAddress: selectedToken.address,
          tokenSymbol: selectedToken.symbol,
          buyerWallet: userWallet,
          sellerWallet: order.sellerWallet,
          chainId: selectedToken.chainId
        }
      })

      // 2. Execute blockchain transaction
      const txHash = await executeBlockchainPayment(response.data.cryptoOrder)

      // 3. Confirm payment
      await orderApi.confirmCryptoPayment(response.data.cryptoOrder.orderId, txHash)

      onPaymentComplete(txHash)
    } catch (error) {
      console.error('Crypto payment failed:', error)
    }
  }

  return (
    <div className="crypto-payment">
      <h3>Pay with Cryptocurrency</h3>

      {!walletConnected ? (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      ) : (
        <>
          <TokenSelector
            tokens={supportedTokens}
            selected={selectedToken}
            onChange={setSelectedToken}
          />
          <Button onClick={payWithCrypto}>Pay with Crypto</Button>
        </>
      )}
    </div>
  )
}
```

#### **3.2 Order Flow Updates**

```typescript
// jobber-client/src/features/order/components/CheckoutForm.tsx
export const CheckoutForm: FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe')

  return (
    <div className="checkout-form">
      {/* Payment Method Selection */}
      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="stripe"
            checked={paymentMethod === 'stripe'}
            onChange={(e) => setPaymentMethod('stripe')}
          />
          Credit Card (Stripe)
        </label>
        <label>
          <input
            type="radio"
            value="crypto"
            checked={paymentMethod === 'crypto'}
            onChange={(e) => setPaymentMethod('crypto')}
          />
          Cryptocurrency
        </label>
      </div>

      {/* Conditional Payment Components */}
      {paymentMethod === 'stripe' ? (
        <StripePayment order={order} />
      ) : (
        <CryptoPayment order={order} />
      )}
    </div>
  )
}
```

---

### **Phase 4: Database & Sync (Week 4)**

#### **4.1 Data Synchronization**

```typescript
// server/crypto-payment-service/src/services/order-sync.service.ts
export class OrderSyncService {
  async syncWithJobberOrder(cryptoOrderId: string, status: string) {
    try {
      const cryptoOrder = await CryptoOrderModel.findOne({
        orderId: cryptoOrderId,
      });

      // Call order-service to update status
      await axios.put(
        `${config.ORDER_SERVICE_URL}/api/v1/order/crypto/${cryptoOrder.jobberOrderId}/status`,
        {
          cryptoStatus: status,
          transactionHash: cryptoOrder.transactionHash,
          blockNumber: cryptoOrder.blockNumber,
        }
      );
    } catch (error) {
      console.error("Order sync failed:", error);
    }
  }

  async handleCryptoPaymentConfirmed(cryptoOrderId: string) {
    await this.syncWithJobberOrder(cryptoOrderId, "confirmed");

    // Trigger notifications, etc.
    await this.sendNotification("payment_confirmed", cryptoOrderId);
  }
}
```

#### **4.2 Event-Driven Updates**

```typescript
// server/crypto-payment-service/src/events/order.events.ts
import { OrderSyncService } from "../services/order-sync.service";

const orderSyncService = new OrderSyncService();

export const handleOrderEvents = {
  onPaymentConfirmed: async (cryptoOrder: ICryptoOrder) => {
    await orderSyncService.handleCryptoPaymentConfirmed(cryptoOrder.orderId);
  },

  onOrderCompleted: async (cryptoOrder: ICryptoOrder) => {
    await orderSyncService.syncWithJobberOrder(
      cryptoOrder.orderId,
      "completed"
    );
  },

  onDisputeRaised: async (cryptoOrder: ICryptoOrder) => {
    await orderSyncService.syncWithJobberOrder(cryptoOrder.orderId, "disputed");
  },
};
```

---

### **Phase 5: Testing & Deployment (Week 5)**

#### **5.1 Integration Tests**

```typescript
// server/crypto-payment-service/test/integration/order-flow.test.ts
describe("Crypto Order Integration", () => {
  it("should create complete order flow", async () => {
    // 1. Create order via gateway
    const orderResponse = await request(gatewayApp)
      .post("/api/gateway/v1/crypto/orders")
      .send(mockCryptoOrderData)
      .expect(201);

    // 2. Verify order in order-service
    const jobberOrder = await OrderModel.findOne({
      orderId: orderResponse.body.order.orderId,
    });
    expect(jobberOrder.paymentType).toBe("crypto");

    // 3. Verify crypto order in crypto-service
    const cryptoOrder = await CryptoOrderModel.findOne({
      jobberOrderId: jobberOrder.orderId,
    });
    expect(cryptoOrder).toBeDefined();
  });
});
```

#### **5.2 Environment Configuration**

```bash
# Add to docker-compose.yaml
services:
  crypto-payment-service:
    build: ./server/crypto-payment-service
    ports:
      - "4012:4012"
    environment:
      - DATABASE_URL=mongodb://mongodb:27017/crypto-payments
      - ORDER_SERVICE_URL=http://order-service:4006
      - GATEWAY_URL=http://gateway-service:4000
    depends_on:
      - mongodb
      - order-service
```

---

## 🔄 **Implementation Steps**

### **Step 1: Prepare Infrastructure**

```bash
# 1. Add crypto service to docker-compose
# 2. Update gateway-service package.json dependencies
# 3. Add environment variables

cd server/gateway-service
npm install axios  # if not already installed
```

### **Step 2: Gateway Integration**

```bash
# 1. Create crypto routes and controllers
# 2. Add crypto service client
# 3. Update main routes.ts
# 4. Test gateway endpoints
```

### **Step 3: Order Service Extension**

```bash
# 1. Update order schema
# 2. Add crypto-specific routes
# 3. Create crypto order controllers
# 4. Test order creation flow
```

### **Step 4: Frontend Development**

```bash
# 1. Create crypto payment components
# 2. Add Web3/MetaMask integration
# 3. Update checkout flow
# 4. Add wallet management
```

### **Step 5: Testing & Deployment**

```bash
# 1. Integration tests
# 2. End-to-end testing
# 3. Load testing
# 4. Production deployment
```

---

## ⚠️ **Considerations & Challenges**

### **Technical Challenges:**

1. **Blockchain Network Latency** - Transaction confirmations take time
2. **Gas Fee Management** - Fluctuating costs
3. **Wallet Integration** - MetaMask, WalletConnect setup
4. **Error Handling** - Failed transactions, network issues

### **Business Considerations:**

1. **Regulatory Compliance** - KYC/AML requirements
2. **Tax Implications** - Crypto payment reporting
3. **Customer Support** - Blockchain transaction support
4. **Market Volatility** - Price fluctuations during payment

### **Solutions:**

```typescript
// Handle network latency
const CONFIRMATION_THRESHOLDS = {
  ethereum: 12,
  polygon: 20,
  bsc: 15,
};

// Gas optimization
const optimizeGasPrice = async (chainId: number) => {
  const gasPrice = await provider.getGasPrice();
  return gasPrice.mul(110).div(100); // +10% buffer
};

// Error recovery
const retryTransaction = async (txHash: string, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt) return receipt;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
```

---

## 📊 **Success Metrics**

### **Technical KPIs:**

- ✅ **API Response Time**: < 200ms for crypto order creation
- ✅ **Transaction Success Rate**: > 95%
- ✅ **Service Uptime**: > 99.9%
- ✅ **Test Coverage**: > 80%

### **Business KPIs:**

- 📈 **Crypto Payment Adoption**: Target 10% of orders
- 💰 **Reduced Payment Fees**: Save 2-3% vs Stripe
- ⚡ **Faster Settlements**: Same-day vs 2-7 days
- 🌍 **Global Reach**: Support 50+ countries

---

## 🚀 **Go-Live Checklist**

### **Technical Readiness:**

- [ ] All services deployed and tested
- [ ] Database migrations completed
- [ ] API documentation updated
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested

### **Business Readiness:**

- [ ] Legal compliance review completed
- [ ] Customer support training completed
- [ ] Marketing materials prepared
- [ ] Risk management procedures in place
- [ ] Rollback plan documented

---

## 🎯 **Timeline Summary**

| Week | Phase            | Deliverables                          |
| ---- | ---------------- | ------------------------------------- |
| 1-2  | Core Integration | Gateway routes, service clients       |
| 2-3  | Order Extension  | Schema updates, crypto controllers    |
| 3-4  | Frontend         | React components, wallet integration  |
| 4    | Data Sync        | Event handling, order synchronization |
| 5    | Testing          | Integration tests, deployment         |

**Total Estimated Time: 5 weeks for full integration**

---

## ✅ **Conclusion**

**Crypto Payment Service integration is HIGHLY FEASIBLE** and will significantly enhance Jobber's value proposition by:

1. **Reducing Payment Costs** (2-3% savings vs Stripe)
2. **Enabling Global Reach** (bypass banking restrictions)
3. **Faster Settlements** (instant vs days)
4. **Modern Tech Appeal** (attract crypto-native users)
5. **Competitive Advantage** (few freelance platforms support crypto)

The existing microservices architecture makes integration straightforward, and the 5-week timeline is realistic for a production-ready implementation.
