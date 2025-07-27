# 🚀 Crypto Payment Service Setup Guide (ETH Only)

Hướng dẫn thiết lập crypto payment service cho thanh toán ETH trong Jobber marketplace.

## 📋 Prerequisites

- Node.js >= 18.0.0
- NPM >= 8.0.0
- MongoDB running
- Wallet với ETH để deploy contract

## 🔧 1. Cài đặt Dependencies

```bash
cd server/crypto-payment-service
npm install
```

## ⚙️ 2. Cấu hình Environment

Tạo file `.env` từ template:

```bash
# Copy file example (tạo thủ công)
# .env
NODE_ENV=development
PORT=4008

# Database
DATABASE_URL=mongodb://mongodb_container:27017/crypto-payments

# Service URLs
ORDER_SERVICE_URL=http://localhost:4006
GATEWAY_URL=http://localhost:4000

# Authentication
JWT_TOKEN=84c94ce9d13434cf635e20a1bbfe30f3
GATEWAY_JWT_TOKEN=d41d8cd98f00b204e9800998ecf8427e

# Blockchain - ETH Only
SEPOLIA_RPC_URL=https://rpc.sepolia.org
LOCAL_RPC_URL=http://127.0.0.1:8545

# Wallet (THỬ NGHIỆM)
PRIVATE_KEY=your-private-key-here
FEE_COLLECTOR_ADDRESS=your-wallet-address

# Smart Contract (sẽ được cập nhật sau khi deploy)
ESCROW_CONTRACT_ADDRESS=

# Platform Settings
PLATFORM_FEE_PERCENTAGE=2000
AUTO_RELEASE_DELAY=604800
```

## 🏗️ 3. Deploy Smart Contract

### Thử nghiệm trên Local Network:

```bash
# Terminal 1: Start local blockchain
npm run node:local

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy-simple.ts --network localhost
```

### Deploy trên Sepolia Testnet:

```bash
# Cần ETH testnet trong wallet
npx hardhat run scripts/deploy-simple.ts --network sepolia
```

### Kết quả deploy:

```
🎉 DEPLOYMENT COMPLETED!
==================================================
Contract Address: 0x1234567890abcdef...
Network: sepolia (11155111)
Fee Collector: 0xabcdef1234567890...
Platform Fee: 20%
Supported Token: ETH only
==================================================
```

## 📝 4. Cập nhật .env

Sau khi deploy thành công, cập nhật file `.env`:

```bash
ESCROW_CONTRACT_ADDRESS=0x1234567890abcdef...
FEE_COLLECTOR_ADDRESS=0xabcdef1234567890...
```

## 🚀 5. Start Service

```bash
npm run dev
```

Service sẽ chạy trên: `http://localhost:4008`

## 🔄 6. Tích hợp với Gateway

Gateway service đã có routes sẵn trong `server/gateway-service/src/routes/crypto.ts`:

### API Endpoints có sẵn:

```typescript
// Tạo crypto order
POST /crypto/orders

// Lấy thông tin order
GET /crypto/orders/:orderId

// Xác nhận payment
PUT /crypto/orders/:orderId/confirm-payment

// Đánh dấu delivered
PUT /crypto/orders/:orderId/delivered

// Complete order
PUT /crypto/orders/:orderId/complete

// Hủy order
PUT /crypto/orders/:orderId/cancel
```

## 📊 7. Flow hoạt động

### Crypto Payment Flow:

```
1. User chọn "Pay with ETH" trên frontend
2. Frontend gọi API tạo crypto order
3. Gateway route đến Crypto Service
4. Crypto Service tạo order trong smart contract
5. User transfer ETH đến smart contract
6. Smart contract giữ ETH trong escrow
7. Seller deliver work
8. ETH được release cho seller (trừ platform fee)
```

### Smart Contract States:

```
Created → Paid → Delivered → Completed
                     ↓
                 Disputed → Resolved
```

## 🧪 8. Testing

### Test Smart Contract:

```bash
npm run test:contracts
```

### Test Service:

```bash
npm run test
```

### Test API manually:

```bash
# Create order
curl -X POST http://localhost:4000/crypto/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-123",
    "buyerAddress": "0x...",
    "sellerAddress": "0x...",
    "amount": "0.1",
    "chainId": 11155111
  }'
```

## 🔍 9. Monitoring

### Check contract on Etherscan:

- Mainnet: `https://etherscan.io/address/{CONTRACT_ADDRESS}`
- Sepolia: `https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}`

### Check service logs:

```bash
docker logs crypto-payment-container
```

## ⚠️ 10. Security Notes

- **Mainnet**: Dùng hardware wallet và test kỹ trước
- **Private Key**: Không commit vào git
- **RPC URL**: Sử dụng Alchemy/Infura cho production
- **Fee Collector**: Sử dụng multi-sig wallet cho production

## 🛠️ 11. Troubleshooting

### Contract deployment failed:

- Check wallet balance
- Check RPC URL
- Check private key format

### Service connection error:

- Check MongoDB connection
- Check contract address in .env
- Check RPC endpoints

### Transaction failed:

- Check gas fees
- Check wallet balance
- Check contract state

## 📞 Support

Nếu gặp vấn đề, check:

1. Logs trong console
2. Contract events trên explorer
3. Service status endpoints
