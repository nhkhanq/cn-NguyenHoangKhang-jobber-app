# Crypto Payment Service - Testing Guide

## 📋 Tổng quan

Hướng dẫn này sẽ giúp bạn thiết lập và chạy test cho crypto-payment-service, bao gồm unit tests, integration tests và smart contract tests.

## 🚀 Thiết lập môi trường test

### 1. Cài đặt dependencies

```bash
cd server/crypto-payment-service
npm install
```

### 2. Cài đặt dependencies cho test (nếu chưa có)

```bash
npm install --save-dev @types/jest @types/supertest @types/node mongodb-memory-server supertest
```

### 3. Thiết lập environment variables cho test

Tạo file `.env.test`:

```env
NODE_ENV=test
DATABASE_URL=mongodb://localhost:27017/crypto-test
CLIENT_URL=http://localhost:3000
PORT=4012

# Blockchain RPC URLs (Test networks)
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Test wallet (DO NOT use real private keys)
PRIVATE_KEY=0x1234567890123456789012345678901234567890123456789012345678901234
ESCROW_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

## 🧪 Các loại test

### 1. Unit Tests

**Mục đích**: Test các function/method riêng lẻ

```bash
# Chạy unit tests
npm run test:unit

# Chạy với coverage
npm run test:unit:coverage
```

**File structure:**
```
test/
├── unit/
│   ├── models/
│   │   └── crypto-order.model.test.ts
│   ├── services/
│   │   └── blockchain.service.test.ts
│   └── controllers/
│       └── crypto-payment.controller.test.ts
```

### 2. Integration Tests

**Mục đích**: Test tích hợp giữa các component

```bash
# Chạy integration tests
npm run test:integration
```

### 3. Smart Contract Tests

**Mục đích**: Test smart contracts với Hardhat

```bash
# Compile contracts
npm run compile:contracts

# Run contract tests
npm run test:contracts

# Test với fork mainnet
npm run test:contracts:fork
```

## 📁 Cấu trúc test files

### Model Tests (`crypto-order.model.test.ts`)

```typescript
describe('CryptoOrder Model', () => {
  describe('Validation', () => {
    it('should validate required fields')
    it('should set default values')
    it('should validate enum values')
  })
  
  describe('Business Logic', () => {
    it('should calculate platform fees')
    it('should handle status transitions')
  })
})
```

### Service Tests (`blockchain.service.test.ts`)

```typescript
describe('BlockchainService', () => {
  describe('Address Validation', () => {
    it('should validate Ethereum addresses')
    it('should reject invalid addresses')
  })
  
  describe('Token Management', () => {
    it('should return supported tokens')
    it('should handle token conversions')
  })
  
  describe('Payment Processing', () => {
    it('should create payment requests')
    it('should verify transactions')
  })
})
```

### Controller Tests (`crypto-payment.controller.test.ts`)

```typescript
describe('CryptoPaymentController', () => {
  describe('POST /crypto/orders', () => {
    it('should create crypto order')
    it('should validate input data')
    it('should handle errors')
  })
  
  describe('Payment Flow', () => {
    it('should process payments')
    it('should mark as delivered')
    it('should complete orders')
  })
})
```

## 🔧 Test Scripts trong package.json

Thêm vào `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest test/unit",
    "test:integration": "jest test/integration",
    "test:e2e": "jest test/e2e",
    "test:contracts": "hardhat test",
    "test:contracts:coverage": "npx hardhat coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## 🎯 Chạy tests

### Chạy tất cả tests

```bash
npm test
```

### Chạy theo loại

```bash
# Unit tests only
npm run test:unit

# Integration tests only  
npm run test:integration

# Smart contract tests
npm run test:contracts

# Watch mode (auto re-run khi file thay đổi)
npm run test:watch
```

### Chạy test với coverage

```bash
npm run test:coverage
```

Coverage report sẽ được tạo trong thư mục `coverage/`

### Chạy test cụ thể

```bash
# Test một file cụ thể
npm test crypto-order.model.test.ts

# Test một test case cụ thể
npm test -- --testNamePattern="should create crypto order"
```

## 📊 Test Coverage Requirements

Mục tiêu coverage:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## 🐛 Debug Tests

### 1. Sử dụng VS Code Debugger

Tạo `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 2. Debug với console.log

```bash
# Chạy test với verbose output
npm test -- --verbose

# Chạy test và hiển thị console.log
npm test -- --silent=false
```

## 🔍 Mocking Strategies

### 1. Mock External Services

```typescript
// Mock blockchain RPC calls
jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn(),
    isAddress: jest.fn(),
    // ...
  }
}));
```

### 2. Mock Database

```typescript
// Sử dụng mongodb-memory-server
import { MongoMemoryServer } from 'mongodb-memory-server';

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});
```

### 3. Mock HTTP Requests

```typescript
// Mock axios for external API calls
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
```

## 📈 Continuous Integration

### GitHub Actions example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v1
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB connection errors**
   ```bash
   # Make sure MongoDB is running
   brew services start mongodb-community
   ```

2. **RPC connection timeout**
   ```bash
   # Use test networks or mock providers
   ```

3. **Jest timeout errors**
   ```bash
   # Increase timeout in jest.config.ts
   testTimeout: 30000
   ```

4. **TypeScript compilation errors**
   ```bash
   # Check tsconfig.json includes test files
   "include": ["src/**/*", "test/**/*"]
   ```

## 📝 Best Practices

1. **Test Organization**
   - Group related tests with `describe()`
   - Use meaningful test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Mocking**
   - Mock external dependencies
   - Use real database for integration tests
   - Mock time-dependent functions

3. **Data Management**
   - Clean up test data after each test
   - Use factory functions for test data
   - Avoid hardcoded values

4. **Performance**
   - Run tests in parallel when possible
   - Use `beforeAll` vs `beforeEach` appropriately
   - Mock expensive operations

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts.html)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server) 