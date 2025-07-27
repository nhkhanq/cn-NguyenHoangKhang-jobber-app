import { FC, ReactElement, useState } from 'react';
import { createSearchParams, useNavigate, NavigateFunction } from 'react-router-dom';
import { ethers } from 'ethers';
import Button from 'src/shared/button/Button';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';
import { IResponse } from 'src/shared/shared.interface';
import { IOffer } from '../../interfaces/order.interface';
import { useProcessCryptoPaymentMutation } from '../../services/crypto.service';
import { ICryptoPaymentRequest } from '../../interfaces/order.interface';
import { CRYPTO_CONFIG, ESCROW_ABI } from 'src/shared/utils/crypto.config';

interface ICryptoPaymentFormProps {
  gigId: string;
  offer: IOffer;
  cryptoOrder: any;
  ethPrice: any;
  walletAddress: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CryptoPaymentForm: FC<ICryptoPaymentFormProps> = ({ gigId, offer, cryptoOrder, ethPrice, walletAddress }): ReactElement => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const navigate: NavigateFunction = useNavigate();
  const [processPayment] = useProcessCryptoPaymentMutation();

  const payViaEscrow = async (): Promise<void> => {
    if (!window.ethereum) {
      showErrorToast('MetaMask not found.');
      return;
    }

    setIsProcessing(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const escrowContract = new ethers.Contract(CRYPTO_CONFIG.ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      const amountInWei = ethers.parseEther(cryptoOrder.amount.toString());

      const tx = await escrowContract.payOrder(cryptoOrder.orderId, {
        value: amountInWei,
        gasLimit: CRYPTO_CONFIG.GAS_LIMITS.PAY_ORDER
      });

      setTransactionHash(tx.hash);
      showSuccessToast('Transaction sent! Waiting for confirmation...');

      const receipt = await tx.wait();

      showSuccessToast('Payment confirmed! Funds deposited to escrow.');

      await confirmPayment(tx.hash, receipt.blockNumber);
    } catch (error: any) {
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        showErrorToast('Transaction rejected by user.');
      } else if (error.message?.includes('insufficient funds')) {
        showErrorToast('Insufficient ETH balance for this transaction.');
      } else if (error.message?.includes('Order does not exist')) {
        showErrorToast('Order not found in escrow contract. Please contact support.');
      } else if (error.message?.includes('Only buyer can call this')) {
        showErrorToast('You must use the buyer wallet address for this order.');
      } else {
        showErrorToast('Transaction failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPayment = async (txHash: string, blockNumber: number): Promise<void> => {
    try {
      const paymentRequest: ICryptoPaymentRequest = {
        orderId: cryptoOrder.orderId,
        transactionHash: txHash,
        blockNumber
      };

      const response: IResponse = await processPayment(paymentRequest).unwrap();

      if ((response as any).success) {
        showSuccessToast('Payment processed successfully!');

        navigate(
          `/gig/order/requirement/${gigId}?${createSearchParams({
            offer: JSON.stringify(offer),
            order_date: `${new Date()}`,
            payment_type: 'crypto',
            crypto_order_id: cryptoOrder.orderId
          })}`
        );
      }
    } catch (error) {
      showErrorToast('Payment sent but confirmation failed. Please contact support with transaction hash: ' + txHash);
    }
  };

  return (
    <div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-green-800 mb-2">🔒 Secure Escrow Payment</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Your payment will be held securely in smart contract escrow</li>
          <li>• Seller only receives payment after you approve the delivered work</li>
          <li>• Built-in dispute resolution and automatic release after 7 days</li>
          <li>• Transparent and secure blockchain-based transactions</li>
        </ul>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-gray-800 mb-3">📋 Escrow Transaction Details</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Buyer (You):</span>
            <span className="font-mono text-xs">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Seller:</span>
            <span className="font-mono text-xs">
              {cryptoOrder?.sellerAddress ? `${cryptoOrder.sellerAddress.slice(0, 6)}...${cryptoOrder.sellerAddress.slice(-4)}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Escrow Contract:</span>
            <span className="font-mono text-xs">
              {CRYPTO_CONFIG.ESCROW_CONTRACT_ADDRESS
                ? `${CRYPTO_CONFIG.ESCROW_CONTRACT_ADDRESS.slice(0, 6)}...${CRYPTO_CONFIG.ESCROW_CONTRACT_ADDRESS.slice(-4)}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold">{cryptoOrder?.amount || '0'} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Fee:</span>
            <span>{cryptoOrder?.platformFee || '0'} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Network:</span>
            <span>
              {cryptoOrder.chainId === 1 ? 'Ethereum Mainnet' : cryptoOrder.chainId === 11155111 ? 'Sepolia Testnet' : 'Local Network'}
            </span>
          </div>
        </div>
      </div>

      {transactionHash && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-800 mb-2">📡 Transaction Sent</h3>
          <p className="text-sm text-blue-700 mb-2">Transaction Hash:</p>
          <p className="font-mono text-xs text-blue-600 break-all">{transactionHash}</p>
          <div className="mt-3 flex items-center text-sm text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Waiting for blockchain confirmation...
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <h3 className="font-medium text-amber-800 mb-2">📝 Escrow Payment Process</h3>
        <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
          <li>You deposit ETH into secure escrow contract</li>
          <li>Seller delivers the work according to requirements</li>
          <li>You review and approve the delivered work</li>
          <li>Payment is automatically released to seller</li>
          <li>If there's a dispute, admin can mediate fairly</li>
        </ol>
      </div>

      {/* Payment Button */}
      <Button
        onClick={payViaEscrow}
        disabled={isProcessing || !!transactionHash}
        className={`w-full rounded px-6 py-3 text-center text-sm font-bold text-white focus:outline-none md:px-4 md:py-2 md:text-base ${
          isProcessing || !!transactionHash ? 'cursor-not-allowed bg-gray-400' : 'bg-green-600 hover:bg-green-700'
        }`}
        label={
          <span className="flex items-center justify-center">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Escrow Payment...
              </>
            ) : transactionHash ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirming Transaction...
              </>
            ) : (
              <>🔒 Pay {cryptoOrder.amount} ETH to Escrow</>
            )}
          </span>
        }
      />

      {/* Security Notice */}
      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium mb-2">🛡️ Security Features:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Funds held in verified smart contract escrow</li>
          <li>No direct payments - seller cannot access funds until approval</li>
          <li>Automatic dispute resolution system</li>
          <li>Transaction hash provides full transparency</li>
          <li>Non-reversible blockchain security</li>
        </ul>
      </div>
    </div>
  );
};

export default CryptoPaymentForm;
