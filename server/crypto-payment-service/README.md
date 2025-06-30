# 🚀 Jobber Crypto Payment Service

Custom blockchain payment service cho Jobber marketplace với hệ thống **escrow tự build từ đầu**.

## 🏗️ **ARCHITECTURE OVERVIEW**

```
📦 crypto-payment-service/
├── 🔐 Smart Contracts (Solidity)
│   ├── JobberEscrow.sol - Main escrow contract
│   └── Multi-token support (ETH, MATIC, BNB, USDT, USDC)
├── 🌐 Backend Services (Node.js + TypeScript)
│   ├── Blockchain Integration (ethers.js)
│   ├── Database (MongoDB)
│   ├── API Endpoints (Express.js)
│   └── Real-time Monitoring
├── 🔄 Payment Flow
│   ├── Order Creation
│   ├── Escrow Deposit
│   ├── Delivery Confirmation
│   ├── Auto-release Mechanism
│   └── Dispute Resolution
└── 🛡️ Security Features
    ├── Multi-signature Support
    ├── Re-entrancy Protection
    ├── Pausable Operations
    └── Emergency Functions
```

## ✨ **FEATURES**

### 🔐 **Smart Contract Features**

- ✅ **Multi-chain Support** (Ethereum, Polygon, BSC)
- ✅ **Multi-token Support** (ETH, MATIC, BNB, USDT, USDC, DAI)
- ✅ **Escrow System** với dispute resolution
- ✅ **Auto-release Mechanism** (7 days default)
- ✅ **Platform Fee Collection** (20% configurable)
- ✅ **Emergency Functions** cho admin
- ✅ **Pausable Operations** cho security
- ✅ **Re-entrancy Protection**

### 🌐 **Backend Features**

- ✅ **RESTful API** với Express.js
- ✅ **MongoDB Database** cho order tracking
- ✅ **Real-time Transaction Monitoring**
- ✅ **Wallet Balance Checking**
- ✅ **Transaction Confirmation Tracking**
- ✅ **Gas Fee Estimation**
- ✅ **Multi-network Support**

### 💰 **Payment Flow**

1. **Order Creation** - Tạo order với thông tin buyer/seller
2. **Payment Deposit** - Buyer gửi crypto vào escrow
3. **Delivery Confirmation** - Seller đánh dấu đã giao
4. **Payment Release** - Buyer approve hoặc auto-release
5. **Fee Distribution** - Platform fee tự động thu

## 🚀 **SETUP & INSTALLATION**

### 1. **Install Dependencies**

```bash
cd server/crypto-payment-service
npm install
```

### 2. **Environment Configuration**

Tạo file `.env`:

```bash
# Server Configuration
NODE_ENV=development
PORT=4012
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=mongodb://localhost:27017/jobber-crypto

# Blockchain RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Private Key for Contract Deployment
PRIVATE_KEY=your_private_key_here

# Platform Settings
PLATFORM_FEE_PERCENTAGE=2000  # 20%
AUTO_RELEASE_DELAY=604800     # 7 days
FEE_COLLECTOR_ADDRESS=your_fee_collector_address
```

### 3. **Smart Contract Deployment**

```bash
# Compile contracts
npm run compile:contracts

# Deploy to Polygon testnet
npm run deploy:contracts -- --network mumbai

# Deploy to mainnet
npm run deploy:contracts -- --network polygon
```

### 4. **Start Development Server**

```bash
npm run dev
```

## 📡 **API ENDPOINTS**

### **Orders Management**

```bash
# Create crypto order
POST /api/v1/crypto/orders
{
  "jobberOrderId": "order_123",
  "buyerAddress": "0x...",
  "sellerAddress": "0x...",
  "tokenAddress": "0x...",
  "tokenSymbol": "USDT",
  "amount": "100",
  "chainId": 137,
  "autoRelease": true
}

# Get order details
GET /api/v1/crypto/orders/:orderId

# Process payment
POST /api/v1/crypto/orders/:orderId/payment
{
  "transactionHash": "0x...",
  "blockNumber": 12345
}

# Mark as delivered
POST /api/v1/crypto/orders/:orderId/delivered

# Complete order
POST /api/v1/crypto/orders/:orderId/complete
```

### **Blockchain Utilities**

```bash
# Get supported tokens
GET /api/v1/crypto/tokens?chainId=137

# Get wallet balance
GET /api/v1/crypto/balance?address=0x...&chainId=137&tokenAddress=0x...

# Get orders by buyer
GET /api/v1/crypto/buyers/:buyerAddress/orders?status=paid&page=1&limit=10
```

## 🔧 **SMART CONTRACT DEPLOYMENT**

### **Step 1: Setup Network Configuration**

Hardhat networks đã được cấu hình cho:

- Ethereum Mainnet
- Polygon
- BSC
- Testnets (Sepolia, Mumbai, BSC Testnet)

### **Step 2: Deploy Contract**

```bash
# Local deployment
npx hardhat run scripts/deploy.ts --network localhost

# Testnet deployment
npx hardhat run scripts/deploy.ts --network mumbai

# Mainnet deployment
npx hardhat run scripts/deploy.ts --network polygon
```

### **Step 3: Verify Contract**

```bash
npx hardhat verify --network polygon CONTRACT_ADDRESS FEE_COLLECTOR_ADDRESS
```

## 🛠️ **DEVELOPMENT COMMANDS**

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Smart Contracts
npm run compile:contracts   # Compile Solidity contracts
npm run test:contracts     # Run contract tests
npm run deploy:contracts   # Deploy contracts
npm run verify:contracts   # Verify on explorer

# Code Quality
npm run lint            # ESLint check
npm run format          # Prettier format
npm run test            # Run tests

# Utilities
npm run clean           # Clean build artifacts
npm run node:local      # Start local Hardhat node
```

## 🌐 **SUPPORTED NETWORKS & TOKENS**

### **Ethereum Mainnet (Chain ID: 1)**

- ETH (Native)
- USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- USDC: `0xA0b86a33E6441b59A82e08A7E9FF5e0a6B1C1E92`
- DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`

### **Polygon (Chain ID: 137)**

- MATIC (Native)
- USDT: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- USDC: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

### **BSC (Chain ID: 56)**

- BNB (Native)
- BUSD: `0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56`
- USDT: `0x55d398326f99059fF775485246999027B3197955`

## 🔄 **INTEGRATION WITH JOBBER SYSTEM**

### **1. Gateway Service Integration**

Thêm vào `server/gateway-service/src/routes/`:

```javascript
// crypto.ts
import express from "express";
import { authMiddleware } from "@gateway/services/auth-middleware";

const router = express.Router();

router.use("/crypto", authMiddleware.verifyUser);
router.use("/crypto", (req, res) => {
  // Proxy to crypto-payment-service
  proxy("http://localhost:4012")(req, res);
});

export { router as cryptoRoutes };
```

### **2. Frontend Integration**

Thêm vào `jobber-client/src/features/`:

```typescript
// crypto-payment/
├── components/
│   ├── CryptoPaymentForm.tsx
│   ├── WalletConnect.tsx
│   └── PaymentStatus.tsx
├── services/
│   └── crypto-payment.service.ts
└── hooks/
    └── useCryptoPayment.ts
```

### **3. Order Service Integration**

Modify `server/order-service/` để support crypto payments:

```javascript
// Add crypto payment option
const paymentMethods = ["stripe", "crypto"];
```

## 🛡️ **SECURITY CONSIDERATIONS**

### **Smart Contract Security**

- ✅ OpenZeppelin contracts
- ✅ Re-entrancy protection
- ✅ Access control mechanisms
- ✅ Pausable operations
- ✅ Emergency withdraw functions

### **Backend Security**

- ✅ Input validation với Joi
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Private key encryption

### **Best Practices**

- 🔐 Never commit private keys
- 🔐 Use environment variables
- 🔐 Implement proper error handling
- 🔐 Monitor transaction confirmations
- 🔐 Set appropriate gas limits

## 📊 **MONITORING & ANALYTICS**

### **Transaction Monitoring**

- Real-time confirmation tracking
- Gas fee monitoring
- Failed transaction alerts
- Balance monitoring

### **Business Metrics**

- Total volume processed
- Platform fees collected
- Order completion rates
- Average processing time

## 🚀 **PRODUCTION DEPLOYMENT**

### **Docker Setup**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4012
CMD ["npm", "start"]
```

### **Docker Compose**

```yaml
version: "3.8"
services:
  crypto-payment-service:
    build: ./server/crypto-payment-service
    ports:
      - "4012:4012"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/jobber-crypto
    depends_on:
      - mongo
```

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/crypto-payment`
3. Commit changes: `git commit -am 'Add crypto payment feature'`
4. Push to branch: `git push origin feature/crypto-payment`
5. Submit pull request

## 📄 **LICENSE**

MIT License - see LICENSE file for details.

---

## 🎯 **ROADMAP**

### **Phase 1: Core Implementation** ✅

- [x] Smart contract development
- [x] Backend API development
- [x] Database schema design
- [x] Basic testing

### **Phase 2: Integration** 🚧

- [ ] Gateway service integration
- [ ] Frontend wallet connection
- [ ] Order flow integration
- [ ] User interface development

### **Phase 3: Advanced Features** 📋

- [ ] Multi-signature support
- [ ] Price oracle integration
- [ ] Advanced dispute resolution
- [ ] Mobile app support
- [ ] DeFi features integration

### **Phase 4: Scaling** 🔮

- [ ] Layer 2 solutions
- [ ] Cross-chain bridges
- [ ] Automated market making
- [ ] Institutional features

---

**🔥 Tự build hoàn toàn từ đầu - Custom blockchain payment system for Jobber marketplace!**
