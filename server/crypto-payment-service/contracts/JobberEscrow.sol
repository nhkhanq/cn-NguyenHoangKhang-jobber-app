// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title JobberEscrow
 * @dev Smart contract for secure crypto payments in Jobber marketplace
 * Features: 
 * - Multi-token support (ETH, MATIC, BNB, USDT, USDC, DAI, etc.)
 * - Escrow system with dispute resolution
 * - Auto-release mechanism
 * - Platform fee collection
 * - Emergency functions
 * - Multi-chain compatibility
 */
contract JobberEscrow is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // Order status enum
    enum OrderStatus {
        Created,        // Order created, waiting for payment
        Paid,          // Payment deposited to escrow
        Delivered,     // Seller marked as delivered
        Completed,     // Payment released to seller
        Disputed,      // Dispute initiated
        Cancelled,     // Order cancelled
        Refunded       // Payment refunded to buyer
    }

    // Order struct
    struct Order {
        string orderId;           // Jobber order ID
        address buyer;            // Buyer wallet address
        address seller;           // Seller wallet address
        address token;            // Token contract (0x0 for ETH/MATIC/BNB)
        uint256 amount;           // Total order amount
        uint256 platformFee;      // Platform fee amount
        uint256 createdAt;        // Order creation timestamp
        uint256 deliveredAt;      // Delivery timestamp
        uint256 releaseTime;      // Auto-release timestamp
        OrderStatus status;       // Current order status
        bool autoRelease;         // Auto-release enabled
    }

    // Events
    event OrderCreated(
        string indexed orderId,
        address indexed buyer,
        address indexed seller,
        address token,
        uint256 amount,
        uint256 platformFee
    );

    event OrderPaid(
        string indexed orderId,
        address indexed buyer,
        uint256 amount
    );

    event OrderDelivered(
        string indexed orderId,
        address indexed seller
    );

    event OrderCompleted(
        string indexed orderId,
        uint256 sellerAmount,
        uint256 platformFee
    );

    event OrderDisputed(
        string indexed orderId,
        address indexed initiator,
        uint256 timestamp
    );

    event DisputeResolved(
        string indexed orderId,
        uint256 buyerRefund,
        uint256 sellerAmount,
        uint256 platformFee,
        uint256 timestamp
    );

    event OrderCancelled(
        string indexed orderId,
        uint256 timestamp
    );

    event OrderRefunded(
        string indexed orderId,
        uint256 refundAmount,
        uint256 timestamp
    );

    event TokenAdded(address indexed token, bool supported);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event AutoReleaseDelayUpdated(uint256 oldDelay, uint256 newDelay);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    event EmergencyWithdraw(address token, uint256 amount, address to);

    // State variables
    mapping(string => Order) public orders;
    mapping(address => bool) public supportedTokens;
    mapping(address => bool) public authorizedOperators;
    
    uint256 public platformFeePercentage = 2000; // 20% in basis points (20 * 100)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public autoReleaseDelay = 7 days; // 7 days auto-release
    uint256 public minimumOrderAmount = 10 * 10**6; // $10 USDT equivalent
    uint256 public maximumOrderAmount = 1000000 * 10**6; // $1M USDT equivalent
    
    address public feeCollector;
    uint256 public totalFeesCollected;
    uint256 public totalOrdersProcessed;

    // Modifiers
    modifier onlyAuthorized() {
        require(
            authorizedOperators[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    modifier orderExists(string memory _orderId) {
        require(
            bytes(orders[_orderId].orderId).length > 0,
            "Order does not exist"
        );
        _;
    }

    modifier onlyBuyer(string memory _orderId) {
        require(
            orders[_orderId].buyer == msg.sender,
            "Only buyer can call this"
        );
        _;
    }

    modifier onlySeller(string memory _orderId) {
        require(
            orders[_orderId].seller == msg.sender,
            "Only seller can call this"
        );
        _;
    }

    modifier inStatus(string memory _orderId, OrderStatus _status) {
        require(
            orders[_orderId].status == _status,
            "Invalid order status"
        );
        _;
    }

    constructor(address _feeCollector) {
        require(_feeCollector != address(0), "Invalid fee collector");
        feeCollector = _feeCollector;
        
        // Add native token support (ETH/MATIC/BNB)
        supportedTokens[address(0)] = true;
        
        // Add owner as authorized operator
        authorizedOperators[msg.sender] = true;
    }

    /**
     * @dev Create a new escrow order
     */
    function createOrder(
        string memory _orderId,
        address _buyer,
        address _seller,
        address _token,
        uint256 _amount,
        bool _autoRelease
    ) external onlyAuthorized whenNotPaused {
        require(bytes(_orderId).length > 0, "Order ID cannot be empty");
        require(_buyer != address(0), "Invalid buyer address");
        require(_seller != address(0), "Invalid seller address");
        require(_buyer != _seller, "Buyer and seller cannot be the same");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount >= minimumOrderAmount, "Amount below minimum");
        require(_amount <= maximumOrderAmount, "Amount above maximum");
        require(supportedTokens[_token], "Token not supported");
        require(
            bytes(orders[_orderId].orderId).length == 0,
            "Order already exists"
        );

        uint256 platformFee = (_amount * platformFeePercentage) / BASIS_POINTS;
        
        orders[_orderId] = Order({
            orderId: _orderId,
            buyer: _buyer,
            seller: _seller,
            token: _token,
            amount: _amount,
            platformFee: platformFee,
            createdAt: block.timestamp,
            deliveredAt: 0,
            releaseTime: 0,
            status: OrderStatus.Created,
            autoRelease: _autoRelease
        });

        emit OrderCreated(
            _orderId,
            _buyer,
            _seller,
            _token,
            _amount,
            platformFee
        );
    }

    /**
     * @dev Buyer pays for the order (deposits funds to escrow)
     */
    function payOrder(string memory _orderId) 
        external 
        payable 
        orderExists(_orderId) 
        onlyBuyer(_orderId) 
        inStatus(_orderId, OrderStatus.Created) 
        nonReentrant 
        whenNotPaused 
    {
        Order storage order = orders[_orderId];
        
        if (order.token == address(0)) {
            // Native token payment (ETH/MATIC/BNB)
            require(msg.value == order.amount, "Incorrect payment amount");
        } else {
            // ERC20 token payment
            require(msg.value == 0, "No native token should be sent");
            IERC20(order.token).safeTransferFrom(
                msg.sender,
                address(this),
                order.amount
            );
        }

        order.status = OrderStatus.Paid;
        totalOrdersProcessed++;
        
        emit OrderPaid(_orderId, msg.sender, order.amount);
    }

    /**
     * @dev Seller marks order as delivered
     */
    function markDelivered(string memory _orderId) 
        external 
        orderExists(_orderId) 
        onlySeller(_orderId) 
        inStatus(_orderId, OrderStatus.Paid) 
        whenNotPaused 
    {
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Delivered;
        order.deliveredAt = block.timestamp;
        
        if (order.autoRelease) {
            order.releaseTime = block.timestamp + autoReleaseDelay;
        }

        emit OrderDelivered(_orderId, msg.sender);
    }

    /**
     * @dev Buyer approves the delivered work and releases payment
     */
    function approveOrder(string memory _orderId) 
        external 
        orderExists(_orderId) 
        onlyBuyer(_orderId) 
        inStatus(_orderId, OrderStatus.Delivered) 
        nonReentrant 
        whenNotPaused 
    {
        _releasePayment(_orderId);
    }

    /**
     * @dev Auto-release payment after delay period
     */
    function autoReleasePayment(string memory _orderId) 
        external 
        orderExists(_orderId) 
        inStatus(_orderId, OrderStatus.Delivered) 
        nonReentrant 
        whenNotPaused 
    {
        Order storage order = orders[_orderId];
        require(order.autoRelease, "Auto-release not enabled");
        require(
            block.timestamp >= order.releaseTime,
            "Auto-release time not reached"
        );
        
        _releasePayment(_orderId);
    }

    /**
     * @dev Internal function to release payment to seller
     */
    function _releasePayment(string memory _orderId) internal {
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Completed;

        uint256 sellerAmount = order.amount - order.platformFee;
        totalFeesCollected += order.platformFee;

        if (order.token == address(0)) {
            // Native token transfer
            payable(order.seller).transfer(sellerAmount);
            payable(feeCollector).transfer(order.platformFee);
        } else {
            // ERC20 token transfer
            IERC20(order.token).safeTransfer(order.seller, sellerAmount);
            IERC20(order.token).safeTransfer(feeCollector, order.platformFee);
        }

        emit OrderCompleted(
            _orderId,
            sellerAmount,
            order.platformFee
        );
    }

    /**
     * @dev Initiate dispute for an order
     */
    function disputeOrder(string memory _orderId) 
        external 
        orderExists(_orderId) 
        whenNotPaused 
    {
        Order storage order = orders[_orderId];
        require(
            msg.sender == order.buyer || msg.sender == order.seller,
            "Only buyer or seller can dispute"
        );
        require(
            order.status == OrderStatus.Paid || order.status == OrderStatus.Delivered,
            "Order cannot be disputed in current status"
        );

        order.status = OrderStatus.Disputed;
        
        emit OrderDisputed(_orderId, msg.sender, block.timestamp);
    }

    /**
     * @dev Admin resolves dispute (only owner)
     */
    function resolveDispute(
        string memory _orderId,
        uint256 _buyerRefundPercentage
    ) 
        external 
        onlyOwner 
        orderExists(_orderId) 
        inStatus(_orderId, OrderStatus.Disputed) 
        nonReentrant 
    {
        require(
            _buyerRefundPercentage <= BASIS_POINTS,
            "Invalid refund percentage"
        );
        
        Order storage order = orders[_orderId];
        order.status = OrderStatus.Completed;

        uint256 totalAmount = order.amount;
        uint256 refundAmount = (totalAmount * _buyerRefundPercentage) / BASIS_POINTS;
        uint256 remainingAmount = totalAmount - refundAmount;
        uint256 sellerAmount = remainingAmount > order.platformFee ? 
            remainingAmount - order.platformFee : 0;
        uint256 actualPlatformFee = remainingAmount - sellerAmount;

        totalFeesCollected += actualPlatformFee;

        if (order.token == address(0)) {
            if (refundAmount > 0) {
                payable(order.buyer).transfer(refundAmount);
            }
            if (sellerAmount > 0) {
                payable(order.seller).transfer(sellerAmount);
            }
            if (actualPlatformFee > 0) {
                payable(feeCollector).transfer(actualPlatformFee);
            }
        } else {
            if (refundAmount > 0) {
                IERC20(order.token).safeTransfer(order.buyer, refundAmount);
            }
            if (sellerAmount > 0) {
                IERC20(order.token).safeTransfer(order.seller, sellerAmount);
            }
            if (actualPlatformFee > 0) {
                IERC20(order.token).safeTransfer(feeCollector, actualPlatformFee);
            }
        }

        emit DisputeResolved(
            _orderId,
            refundAmount,
            sellerAmount,
            actualPlatformFee,
            block.timestamp
        );
    }

    /**
     * @dev Cancel order (only if not paid yet)
     */
    function cancelOrder(string memory _orderId) 
        external 
        orderExists(_orderId) 
        onlyAuthorized 
        inStatus(_orderId, OrderStatus.Created) 
        whenNotPaused 
    {
        orders[_orderId].status = OrderStatus.Cancelled;
        emit OrderCancelled(_orderId, block.timestamp);
    }

    /**
     * @dev Refund order (emergency function for paid orders)
     */
    function refundOrder(string memory _orderId)
        external
        onlyOwner
        orderExists(_orderId)
        nonReentrant
    {
        Order storage order = orders[_orderId];
        require(
            order.status == OrderStatus.Paid || order.status == OrderStatus.Delivered,
            "Order cannot be refunded"
        );

        order.status = OrderStatus.Refunded;

        if (order.token == address(0)) {
            payable(order.buyer).transfer(order.amount);
        } else {
            IERC20(order.token).safeTransfer(order.buyer, order.amount);
        }

        emit OrderRefunded(_orderId, order.amount, block.timestamp);
    }

    // Admin functions
    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
        emit TokenAdded(_token, true);
    }

    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
        emit TokenAdded(_token, false);
    }

    function setAuthorizedOperator(address _operator, bool _authorized) external onlyOwner {
        authorizedOperators[_operator] = _authorized;
    }

    function setPlatformFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 5000, "Fee cannot exceed 50%");
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = _feePercentage;
        emit PlatformFeeUpdated(oldFee, _feePercentage);
    }

    function setAutoReleaseDelay(uint256 _delay) external onlyOwner {
        require(_delay >= 1 days && _delay <= 30 days, "Invalid delay range");
        uint256 oldDelay = autoReleaseDelay;
        autoReleaseDelay = _delay;
        emit AutoReleaseDelayUpdated(oldDelay, _delay);
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector");
        address oldCollector = feeCollector;
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(oldCollector, _feeCollector);
    }

    function setMinimumOrderAmount(uint256 _amount) external onlyOwner {
        minimumOrderAmount = _amount;
    }

    function setMaximumOrderAmount(uint256 _amount) external onlyOwner {
        maximumOrderAmount = _amount;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // View functions
    function getOrder(string memory _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }

    function getOrderStatus(string memory _orderId) external view returns (OrderStatus) {
        return orders[_orderId].status;
    }

    function isTokenSupported(address _token) external view returns (bool) {
        return supportedTokens[_token];
    }

    function getContractBalance(address _token) external view returns (uint256) {
        if (_token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(_token).balanceOf(address(this));
        }
    }

    function getOrdersByBuyer(address /* _buyer */) external pure returns (string[] memory) {
        // This would require additional storage to track efficiently
        // For now, return empty array - implement off-chain indexing
        string[] memory emptyArray;
        return emptyArray;
    }

    function getOrdersBySeller(address /* _seller */) external pure returns (string[] memory) {
        // This would require additional storage to track efficiently
        // For now, return empty array - implement off-chain indexing
        string[] memory emptyArray;
        return emptyArray;
    }

    // Emergency functions
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        
        if (_token == address(0)) {
            require(address(this).balance >= _amount, "Insufficient balance");
            payable(owner()).transfer(_amount);
        } else {
            require(
                IERC20(_token).balanceOf(address(this)) >= _amount,
                "Insufficient token balance"
            );
            IERC20(_token).safeTransfer(owner(), _amount);
        }

        emit EmergencyWithdraw(_token, _amount, owner());
    }

    function emergencyPause() external onlyOwner {
        _pause();
    }

    // Receive function for native token payments
    receive() external payable {
        // Allow contract to receive native tokens
    }

    // Fallback function
    fallback() external payable {
        revert("Function not found");
    }
} 