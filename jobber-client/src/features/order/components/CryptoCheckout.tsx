import { FC, ReactElement, useEffect, useState } from 'react';
import { FaCog, FaRegClock, FaRegMoneyBillAlt, FaEthereum } from 'react-icons/fa';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { IResponse } from 'src/shared/shared.interface';
import { saveToLocalStorage, showErrorToast, showSuccessToast, generateRandomNumber } from 'src/shared/utils/utils.service';
import { IOffer, ICryptoOrderRequest } from '../interfaces/order.interface';
import { useGetETHPriceMutation, useCreateCryptoOrderMutation, useGetSellerWalletQuery } from '../services/crypto.service';
import CryptoPaymentForm from './crypto-form/CryptoPaymentForm';
import { CRYPTO_CONFIG } from 'src/shared/utils/crypto.config';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface IEthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (accounts: string[]) => void) => void;
  removeListener: (event: string, handler: (accounts: string[]) => void) => void;
}

const CryptoCheckout: FC = (): ReactElement => {
  const buyer = useAppSelector((state: IReduxState) => state.buyer);
  const authUser = useAppSelector((state: IReduxState) => state.authUser);

  // Use auth user data if buyer data is empty
  const userData = buyer._id
    ? buyer
    : {
        _id: authUser.id || 'guest',
        username: authUser.username || 'guest',
        email: authUser.email || 'guest@example.com',
        profilePicture: authUser.profilePicture || '',
        country: authUser.country || '',
        isSeller: false,
        purchasedGigs: [],
        createdAt: ''
      };
  const [ethPrice, setEthPrice] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [cryptoOrder, setCryptoOrder] = useState<any>(null);
  const [hasCheckedConnection, setHasCheckedConnection] = useState<boolean>(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string>('');
  const { gigId } = useParams<string>();
  const [searchParams] = useSearchParams({});
  const { state }: { state: ISellerGig } = useLocation();
  const [offer] = useState<IOffer>(JSON.parse(`${searchParams.get('offer')}`));
  const serviceFee: number = offer.price < 50 ? (5.5 / 100) * offer.price + 2 : (5.5 / 100) * offer.price;
  const [getETHPrice] = useGetETHPriceMutation();
  const [createCryptoOrder] = useCreateCryptoOrderMutation();

  const {
    data: sellerWalletData,
    error: sellerWalletError,
    isLoading: isLoadingSellerWallet
  } = useGetSellerWalletQuery(state?.sellerId || '', {
    skip: !state?.sellerId
  });

  const fetchETHPrice = async (): Promise<void> => {
    try {
      setIsLoadingPrice(true);
      const totalAmount = offer.price + serviceFee;
      const response: IResponse = await getETHPrice({ usdAmount: totalAmount }).unwrap();
      setEthPrice((response as any).data || response);
    } catch (error) {
      showErrorToast('Error fetching ETH price.');
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const isMetaMaskInstalled = (): boolean => {
    return typeof window.ethereum !== 'undefined';
  };

  const connectWallet = async (): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      showErrorToast('MetaMask is not installed. Please install MetaMask to continue.');
      window.open('https://metamask.io/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const ethereum = window.ethereum as IEthereumProvider;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        showSuccessToast('Wallet connected successfully!');

        // Create order after delay
        setTimeout(() => attemptCreateOrder(accounts[0]), 1000);
      }
    } catch (error: any) {
      if (error.code === 4001) {
        showErrorToast('Connection rejected by user.');
      } else {
        showErrorToast('Error connecting to wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const createCryptoOrderIntent = async (buyerAddress: string): Promise<void> => {
    try {
      setIsCreatingOrder(true);
      setOrderError('');
      const totalAmount = offer.price + serviceFee;

      if (isLoadingPrice) {
        console.log('Still loading ETH price, waiting...');
        return;
      }

      if (!ethPrice) {
        setOrderError('ETH price not loaded. Please try again.');
        return;
      }

      if (isLoadingSellerWallet) {
        console.log('Still loading seller wallet, waiting...');
        return;
      }

      if (sellerWalletError) {
        setOrderError('Unable to get seller wallet address. Please try again.');
        return;
      }

      if (!sellerWalletData || !(sellerWalletData as any).success) {
        setOrderError('Seller has not set up crypto wallet. Please contact seller to add their wallet address.');
        return;
      }

      const sellerWalletAddress = (sellerWalletData as any).data.walletAddress;

      console.log('Creating crypto order with data:', {
        usdAmount: totalAmount,
        buyerAddress,
        sellerAddress: sellerWalletAddress,
        gigTitle: offer.gigTitle,
        description: offer.description,
        chainId: CRYPTO_CONFIG.CHAIN_ID.DEVELOPMENT,
        // Additional data for backend to construct full order
        gigId: `${gigId}`,
        sellerId: `${state.sellerId}`,
        sellerImage: `${state.profilePicture}`,
        sellerUsername: `${state.username}`,
        sellerEmail: `${state.email}`,
        gigCoverImage: `${state.coverImage}`,
        gigMainTitle: `${state.title}`,
        gigBasicTitle: `${state.basicTitle}`,
        gigBasicDescription: `${state.basicDescription}`,
        buyerId: `${userData._id}`,
        buyerUsername: `${userData.username}`,
        buyerImage: `${userData.profilePicture}`,
        buyerEmail: `${userData.email}`,
        offer,
        serviceFee
      });

      const orderData: ICryptoOrderRequest = {
        usdAmount: totalAmount,
        buyerAddress,
        sellerAddress: sellerWalletAddress,
        gigTitle: offer.gigTitle,
        description: offer.description,
        chainId: CRYPTO_CONFIG.CHAIN_ID.DEVELOPMENT,
        // Additional data for backend to construct full order
        gigId: `${gigId}`,
        sellerId: `${state.sellerId}`,
        sellerImage: `${state.profilePicture}`,
        sellerUsername: `${state.username}`,
        sellerEmail: `${state.email}`,
        gigCoverImage: `${state.coverImage}`,
        gigMainTitle: `${state.title}`,
        gigBasicTitle: `${state.basicTitle}`,
        gigBasicDescription: `${state.basicDescription}`,
        buyerId: `${userData._id}`,
        buyerUsername: `${userData.username}`,
        buyerImage: `${userData.profilePicture}`,
        buyerEmail: `${userData.email}`,
        offer,
        serviceFee
      } as any;

      const response: IResponse = await createCryptoOrder(orderData).unwrap();
      console.log('Crypto order created successfully:', response);

      // Extract crypto order data from response
      const cryptoOrderData = (response as any).cryptoOrder?.data || (response as any).cryptoOrder;
      if (cryptoOrderData && cryptoOrderData.success !== false) {
        setCryptoOrder(cryptoOrderData);
        const cryptoOrderId = cryptoOrderData.orderId;
        saveToLocalStorage('cryptoOrderId', JSON.stringify(cryptoOrderId));
      } else {
        throw new Error(cryptoOrderData?.message || 'Failed to create crypto order');
      }

      showSuccessToast('Crypto order created! You can now proceed with payment.');
    } catch (error: any) {
      console.error('Error creating crypto order:', error);
      const errorMessage = error?.data?.message || error?.message || 'Error creating crypto order.';
      setOrderError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const attemptCreateOrder = async (buyerAddress: string): Promise<void> => {
    if (!isLoadingPrice && !isLoadingSellerWallet && ethPrice && sellerWalletData) {
      await createCryptoOrderIntent(buyerAddress);
    } else {
      // Retry after delay if data still loading
      setTimeout(() => attemptCreateOrder(buyerAddress), 500);
    }
  };

  const setupAccountListener = (ethereum: IEthereumProvider): (() => void) => {
    const handleAccountsChanged = (newAccounts: string[]) => {
      if (newAccounts.length > 0) {
        setWalletAddress(newAccounts[0]);
        setCryptoOrder(null);
      } else {
        setWalletAddress('');
        setCryptoOrder(null);
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  };

  const checkConnection = async (): Promise<void> => {
    if (hasCheckedConnection || !isMetaMaskInstalled()) {
      return;
    }

    try {
      const ethereum = window.ethereum as IEthereumProvider;
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      setHasCheckedConnection(true);

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);

        // Setup account change listener
        setupAccountListener(ethereum);

        // Create order after delay
        setTimeout(() => attemptCreateOrder(accounts[0]), 1000);
      }
    } catch (error) {
      console.warn('Error checking MetaMask connection:', error);
      setHasCheckedConnection(true);
    }
  };

  useEffect(() => {
    fetchETHPrice();

    if (!hasCheckedConnection) {
      checkConnection();
    }

    // Cleanup function
    return () => {
      if (window.ethereum) {
        const ethereum = window.ethereum as IEthereumProvider;
        // Remove any existing listeners
        ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [hasCheckedConnection]);

  return (
    <div className="container mx-auto h-screen">
      <div className="flex flex-wrap">
        <div className="w-full p-4 lg:w-2/3 order-last lg:order-first">
          <div className="border border-grey">
            <div className="text-xl font-medium mb-3 pt-3 pb-4 px-4">
              <span className="flex items-center">
                <FaEthereum className="mr-2 text-blue-600" />
                Crypto Payment
              </span>
            </div>

            {isLoadingPrice ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg mx-4 mb-4 p-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-gray-600">Loading ETH price...</span>
                </div>
              </div>
            ) : ethPrice ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg mx-4 mb-4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold">${(offer.price + serviceFee).toFixed(2)} USD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">ETH Amount</p>
                    <p className="text-lg font-bold text-blue-600">{ethPrice.ethAmount} ETH</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">Exchange Rate: {ethPrice.exchangeRate}</div>
              </div>
            ) : null}

            {!walletAddress ? (
              <div className="px-4 pb-4">
                {sellerWalletError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-red-800 mb-2">Seller Wallet Error</h3>
                    <p className="text-sm text-red-700">Unable to get seller wallet address. Please try refreshing the page.</p>
                  </div>
                )}

                {sellerWalletData && !(sellerWalletData as any).success && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-yellow-800 mb-2">Seller Setup Required</h3>
                    <p className="text-sm text-yellow-700">
                      This seller has not set up their crypto wallet yet. Please contact them to add their wallet address.
                    </p>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Connect Your Wallet</h3>
                  <p className="text-sm text-yellow-700 mb-3">You need to connect your MetaMask wallet to proceed with crypto payment.</p>
                  <button
                    onClick={connectWallet}
                    disabled={
                      isConnecting ||
                      isLoadingSellerWallet ||
                      isLoadingPrice ||
                      !!sellerWalletError ||
                      (sellerWalletData && !(sellerWalletData as any).success)
                    }
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                      isConnecting ||
                      isLoadingSellerWallet ||
                      isLoadingPrice ||
                      !!sellerWalletError ||
                      (sellerWalletData && !(sellerWalletData as any).success)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {isConnecting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </div>
                    ) : isLoadingPrice ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Loading price...
                      </div>
                    ) : isLoadingSellerWallet ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Loading seller info...
                      </div>
                    ) : !!sellerWalletError ? (
                      <div className="flex items-center">
                        <span>Cannot Load Seller Info</span>
                      </div>
                    ) : sellerWalletData && !(sellerWalletData as any).success ? (
                      <div className="flex items-center">
                        <span>Seller Wallet Not Setup</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                          alt="MetaMask"
                          className="w-5 h-5 mr-2"
                        />
                        Connect MetaMask
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 pb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-green-800 mb-1">Wallet Connected</h3>
                  <p className="text-sm text-green-700 font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>

                {/* Debug Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-xs">
                  <div className="font-medium mb-2">Debug Info:</div>
                  <div>ETH Price: {ethPrice ? '✅ Loaded' : '❌ Not loaded'}</div>
                  <div>Seller Wallet: {sellerWalletData ? '✅ Loaded' : '❌ Not loaded'}</div>
                  <div>Crypto Order: {cryptoOrder ? '✅ Created' : '❌ Not created'}</div>
                  <div>Creating Order: {isCreatingOrder ? '🔄 Yes' : '⏹️ No'}</div>
                  {orderError && <div className="text-red-600">Error: {orderError}</div>}
                </div>

                {/* Order Creation Status */}
                {isCreatingOrder && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-blue-800 font-medium">Creating crypto order...</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">Setting up escrow contract and preparing payment...</p>
                  </div>
                )}

                {/* Order Error */}
                {orderError && !isCreatingOrder && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-red-800 mb-2">Order Creation Failed</h3>
                    <p className="text-sm text-red-700 mb-3">{orderError}</p>
                    <button
                      onClick={() => attemptCreateOrder(walletAddress)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Retry Create Order
                    </button>
                  </div>
                )}

                {/* Payment Form */}
                {cryptoOrder && ethPrice && !isCreatingOrder && (
                  <CryptoPaymentForm
                    gigId={`${gigId}`}
                    offer={offer}
                    cryptoOrder={cryptoOrder}
                    ethPrice={ethPrice}
                    walletAddress={walletAddress}
                  />
                )}

                {/* Manual Create Order Button (if no order and not creating) */}
                {!cryptoOrder && !isCreatingOrder && !orderError && ethPrice && sellerWalletData && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-yellow-800 mb-2">Ready to Create Order</h3>
                    <p className="text-sm text-yellow-700 mb-3">All requirements met. Click below to create your crypto payment order.</p>
                    <button
                      onClick={() => attemptCreateOrder(walletAddress)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Create Crypto Order
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full p-4 lg:w-1/3">
          <div className="border border-grey mb-8">
            <div className="pt-3 pb-4 px-4 mb-2 flex flex-col border-b md:flex-row">
              <img className="object-cover w-20 h-11" src={state.coverImage} alt="Gig Cover Image" />
              <h4 className="font-bold text-sm text-[#161c2d] mt-2 md:pl-4 md:mt-0">{state.title}</h4>
            </div>

            <div className="flex justify-between text-sm px-4 py-2">
              <span>Gig Price</span>
              <span>${offer.price}</span>
            </div>
            <div className="flex justify-between text-sm px-4 py-2">
              <span>Service Fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t px-4 py-3">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${(offer.price + serviceFee).toFixed(2)}</span>
              </div>
              {ethPrice && (
                <div className="flex justify-between text-sm text-blue-600 mt-1">
                  <span>ETH Equivalent</span>
                  <span>{ethPrice.ethAmount} ETH</span>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t">
              <div className="flex justify-between text-sm">
                <div className="flex">
                  <FaRegClock className="mr-2 text-[#62646a] mt-1" />
                  <span>Delivery Time</span>
                </div>
                <span>
                  {offer.deliveryInDays} day{offer.deliveryInDays > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoCheckout;
