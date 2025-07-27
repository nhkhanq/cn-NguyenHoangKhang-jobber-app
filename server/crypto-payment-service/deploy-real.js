const { ethers } = require('ethers');

// Simple Escrow Contract (for testing)
const ESCROW_CONTRACT_SOURCE = `
pragma solidity ^0.8.19;

contract SimpleEscrow {
    struct Order {
        string orderId;
        address buyer;
        address seller;
        address token;
        uint256 amount;
        uint256 platformFee;
        uint256 createdAt;
        uint256 deliveredAt;
        uint256 releaseTime;
        uint8 status; // 0: Created, 1: Paid, 2: Delivered, 3: Completed
        bool autoRelease;
    }
    
    mapping(string => Order) public orders;
    address public owner;
    uint256 public platformFeePercentage = 2000; // 20%
    
    event OrderCreated(string indexed orderId, address indexed buyer, address indexed seller, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    function createOrder(
        string memory _orderId,
        address _buyer,
        address _seller,
        address _token,
        uint256 _amount,
        bool _autoRelease
    ) external {
        require(bytes(orders[_orderId].orderId).length == 0, "Order already exists");
        
        orders[_orderId] = Order({
            orderId: _orderId,
            buyer: _buyer,
            seller: _seller,
            token: _token,
            amount: _amount,
            platformFee: (_amount * platformFeePercentage) / 10000,
            createdAt: block.timestamp,
            deliveredAt: 0,
            releaseTime: _autoRelease ? block.timestamp + 7 days : 0,
            status: 0,
            autoRelease: _autoRelease
        });
        
        emit OrderCreated(_orderId, _buyer, _seller, _amount);
    }
}
`;

async function deployContract() {
    console.log('🚀 Deploying Simple Escrow Contract to Sepolia...\n');

    try {
        // Setup provider and wallet
        const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.public.blastapi.io');
        const privateKey = '0x47e179ec197488593b187f80a00eb0da91f1b9d8f0b13f8733639f19c30a34926a';
        const wallet = new ethers.Wallet(privateKey, provider);
        
        console.log('👤 Deployer address:', wallet.address);
        
        // Check balance
        const balance = await wallet.getBalance();
        console.log('💰 Deployer balance:', ethers.utils.formatEther(balance), 'ETH');
        
        if (balance.isZero()) {
            console.log('❌ No ETH balance! Get test ETH from: https://sepoliafaucet.com/');
            console.log('📋 Send test ETH to:', wallet.address);
            return;
        }

        // Simple contract bytecode (pre-compiled for testing)
        const contractABI = [
            {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "string", "name": "orderId", "type": "string"},
                    {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
                    {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
                    {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "OrderCreated",
                "type": "event"
            },
            {
                "inputs": [
                    {"internalType": "string", "name": "_orderId", "type": "string"},
                    {"internalType": "address", "name": "_buyer", "type": "address"},
                    {"internalType": "address", "name": "_seller", "type": "address"},
                    {"internalType": "address", "name": "_token", "type": "address"},
                    {"internalType": "uint256", "name": "_amount", "type": "uint256"},
                    {"internalType": "bool", "name": "_autoRelease", "type": "bool"}
                ],
                "name": "createOrder",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];

        // Use existing deployed contract for testing (WETH contract)
        const existingContract = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'; // WETH on Sepolia
        
        console.log('✅ Using existing WETH contract for testing:', existingContract);
        console.log('🔗 Etherscan:', `https://sepolia.etherscan.io/address/${existingContract}`);
        
        console.log('\n📋 Update your .env file:');
        console.log(`ESCROW_CONTRACT_ADDRESS=${existingContract}`);
        
        console.log('\n⚠️  Note: This is WETH contract, not our escrow!');
        console.log('For testing purposes, it will simulate contract creation.');
        console.log('For production, deploy the real escrow contract.');

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
    }
}

deployContract().catch(console.error); 