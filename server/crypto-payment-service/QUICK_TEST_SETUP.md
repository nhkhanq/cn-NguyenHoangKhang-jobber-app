# 🧪 Quick Test Setup Guide

## 📦 Cài đặt dependencies

```bash
cd server/crypto-payment-service

# Cài đặt test dependencies
npm install --save-dev \
  @types/jest \
  @types/supertest \
  @types/node \
  @types/chai \
  @types/mocha \
  mongodb-memory-server \
  supertest \
  chai

# Cài đặt hardhat dependencies cho smart contract tests
npm install --save-dev \
  @nomiclabs/hardhat-ethers \
  @nomiclabs/hardhat-waffle \
  chai \
  ethereum-waffle
```

## 🚀 Chạy tests

### 1. Unit Tests (API & Services)
```bash
# Chạy tất cả unit tests
npm run test:unit

# Chạy test với coverage
npm run test:coverage

# Chạy test watch mode
npm run test:watch
```

### 2. Smart Contract Tests
```bash
# Compile contracts trước
npm run compile:contracts

# Chạy contract tests
npm run test:contracts

# Test với coverage
npm run test:contracts:coverage
```

### 3. Integration Tests
```bash
npm run test:integration
```

## 📊 Test Coverage

Sau khi chạy `npm run test:coverage`, xem coverage report:
```bash
open coverage/lcov-report/index.html
```

## 🔧 Sửa lỗi TypeScript

Nếu gặp lỗi TypeScript, thêm vào `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["node", "jest", "chai", "mocha"],
    "lib": ["ES2020", "DOM"],
    "skipLibCheck": true
  },
  "include": [
    "src/**/*",
    "test/**/*",
    "contracts/**/*"
  ]
}
```

## 📝 Ví dụ Test Files

### Unit Test Example (`test/unit/simple.test.ts`)
```typescript
describe('Simple Math', () => {
  it('should add numbers correctly', () => {
    expect(2 + 2).toBe(4);
  });

  it('should calculate platform fee', () => {
    const amount = 100;
    const feePercentage = 0.2;
    const fee = amount * feePercentage;
    expect(fee).toBe(20);
  });
});
```

### Controller Test Example
```typescript
import request from 'supertest';
import app from '../../src/app';

describe('Health Check', () => {
  it('should return 200 for health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });
});
```

## 🐛 Debug Issues

### 1. Database Connection
```bash
# Đảm bảo MongoDB đang chạy
brew services start mongodb-community
# hoặc
sudo systemctl start mongod
```

### 2. Environment Variables
```bash
# Tạo .env.test file
cp .env .env.test
# Sửa DATABASE_URL thành test database
```

### 3. Jest Timeout
Nếu test bị timeout, thêm vào `jest.config.ts`:
```typescript
{
  testTimeout: 30000, // 30 seconds
}
```

## 🎯 Test Examples Chạy Được

### 1. Model Validation Test
```bash
npm test -- --testNamePattern="crypto order model"
```

### 2. API Endpoint Test
```bash
npm test -- --testNamePattern="create order"
```

### 3. Smart Contract Test
```bash
npm run test:contracts -- --grep "should create order"
```

## 📈 Continuous Testing

```bash
# Watch mode - auto run tests khi file thay đổi
npm run test:watch

# Run only changed files
npm test -- --onlyChanged
```

## ✅ Verification Commands

Test xem setup có hoạt động:

```bash
# 1. Check jest config
npx jest --showConfig

# 2. Run simple test
npx jest --testNamePattern="simple"

# 3. Check hardhat
npx hardhat compile

# 4. Test database connection
npm run test -- --testNamePattern="mongo"
```

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra `node_modules` đã install đầy đủ
2. Xóa `node_modules` và `package-lock.json`, cài lại
3. Kiểm tra Node.js version >= 18
4. Đảm bảo TypeScript version tương thích 