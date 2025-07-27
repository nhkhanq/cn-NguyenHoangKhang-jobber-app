export const CRYPTO_CONFIG = {
  ESCROW_CONTRACT_ADDRESS: import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH contract for testing
  
  CHAIN_ID: {
    DEVELOPMENT: 11155111, // Use Sepolia testnet instead of local
    MAINNET: 1,
    POLYGON: 137,
    BSC: 56
  },
  
  CRYPTO_SERVICE_URL: import.meta.env.VITE_CRYPTO_SERVICE_URL || 'http://localhost:4008',
  
  TOKENS: {
    ETH_ADDRESS: '0x0000000000000000000000000000000000000000',
  },
  
  GAS_LIMITS: {
    PAY_ORDER: 300000,
    CREATE_ORDER: 200000,
    APPROVE_ORDER: 150000
  }
};

export const ESCROW_ABI = [
  {
    inputs: [{ internalType: 'string', name: '_orderId', type: 'string' }],
    name: 'payOrder',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: '_orderId', type: 'string' },
      { internalType: 'address', name: '_buyer', type: 'address' },
      { internalType: 'address', name: '_seller', type: 'address' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'bool', name: '_autoRelease', type: 'bool' }
    ],
    name: 'createOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'string', name: '_orderId', type: 'string' }],
    name: 'approveOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'string', name: '_orderId', type: 'string' }],
    name: 'markDelivered',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'string', name: 'orderId', type: 'string' },
      { indexed: true, internalType: 'address', name: 'buyer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'OrderPaid',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'string', name: 'orderId', type: 'string' },
      { indexed: true, internalType: 'address', name: 'seller', type: 'address' }
    ],
    name: 'OrderDelivered',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'string', name: 'orderId', type: 'string' },
      { indexed: true, internalType: 'address', name: 'seller', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'OrderApproved',
    type: 'event'
  }
];

export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address || address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}; 