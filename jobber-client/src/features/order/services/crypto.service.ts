import { IResponse } from 'src/shared/shared.interface';
import { api } from 'src/store/api';

import { ICryptoOrderRequest, ICryptoPaymentRequest } from '../interfaces/order.interface';

export const cryptoApi = api.injectEndpoints({
  endpoints: (build) => ({
    getETHPrice: build.mutation<IResponse, { usdAmount: number }>({
      query({ usdAmount }) {
        return {
          url: `crypto/price?usdAmount=${usdAmount}`,
          method: 'GET'
        };
      },
      invalidatesTags: ['Crypto']
    }),
    getSupportedTokens: build.query<IResponse, void>({
      query: () => 'crypto/tokens',
      providesTags: ['Crypto']
    }),
    createCryptoOrder: build.mutation<IResponse, ICryptoOrderRequest>({
      query(body: ICryptoOrderRequest) {
        return {
          url: 'order/crypto',
          method: 'POST',
          body
        };
      },
      invalidatesTags: ['Crypto', 'Order']
    }),
    getCryptoOrderByOrderId: build.query<IResponse, string>({
      query: (orderId: string) => `crypto/orders/${orderId}`,
      providesTags: ['Crypto']
    }),
    processCryptoPayment: build.mutation<IResponse, ICryptoPaymentRequest>({
      query({ orderId, ...body }) {
        return {
          url: `crypto/orders/${orderId}/payment`,
          method: 'POST',
          body
        };
      },
      invalidatesTags: ['Crypto', 'Order']
    }),
    confirmCryptoPayment: build.mutation<IResponse, {
      orderId: string;
      transactionHash: string;
      blockNumber: number;
    }>({
      query({ orderId, ...body }) {
        return {
          url: `order/crypto/${orderId}/confirm-payment`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Crypto', 'Order']
    }),
    updateCryptoOrderStatus: build.mutation<IResponse, {
      orderId: string;
      status: string;
      transactionHash?: string;
      blockNumber?: number;
    }>({
      query({ orderId, ...body }) {
        return {
          url: `crypto/orders/${orderId}/status`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Crypto', 'Order']
    }),
    markCryptoOrderDelivered: build.mutation<IResponse, { orderId: string; deliveryProof?: string; deliveredWork?: any[] }>({
      query({ orderId, ...body }) {
        return {
          url: `order/crypto/${orderId}/delivered`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Crypto', 'Order']
    }),
    approveCryptoOrder: build.mutation<IResponse, { 
      orderId: string; 
      rating?: number; 
      review?: string;
      buyerId?: string;
      sellerId?: string;
      ongoingJobs?: number;
      completedJobs?: number;
      totalEarnings?: number;
      purchasedGigs?: number;
    }>({
      query({ orderId, ...body }) {
        return {
          url: `order/crypto/${orderId}/approve`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Crypto', 'Order']
    }),
    disputeCryptoOrder: build.mutation<IResponse, { orderId: string; reason: string; evidence?: string }>({
      query({ orderId, ...body }) {
        return {
          url: `crypto/orders/${orderId}/dispute`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Crypto', 'Order']
    }),
    cancelCryptoOrder: build.mutation<IResponse, { 
      orderId: string; 
      reason: string;
      buyerId?: string;
      sellerId?: string;
      purchasedGigs?: number;
    }>({
      query({ orderId, ...body }) {
        return {
          url: `order/crypto/${orderId}/cancel`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Crypto', 'Order']
    }),
    getWalletBalance: build.query<IResponse, { address: string; chainId: number }>({
      query: ({ address, chainId }) => `crypto/balance/${address}/${chainId}`,
      providesTags: ['Crypto']
    }),
    getTransactionDetails: build.query<IResponse, { txHash: string; chainId: number }>({
      query: ({ txHash, chainId }) => `crypto/transaction/${txHash}/${chainId}`,
      providesTags: ['Crypto']
    }),
    getCryptoOrdersByBuyer: build.query<IResponse, {
      buyerAddress: string;
      status?: string;
      limit?: number;
      offset?: number;
    }>({
      query: ({ buyerAddress, ...params }) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        return `crypto/buyers/${buyerAddress}/orders?${searchParams.toString()}`;
      },
      providesTags: ['Crypto']
    }),
    getCryptoOrdersBySeller: build.query<IResponse, {
      sellerAddress: string;
      status?: string;
      limit?: number;
      offset?: number;
    }>({
      query: ({ sellerAddress, ...params }) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        return `crypto/sellers/${sellerAddress}/orders?${searchParams.toString()}`;
      },
      providesTags: ['Crypto']
    }),
    getSellerWallet: build.query<IResponse, string>({
      query: (sellerId: string) => `crypto/sellers/${sellerId}/wallet`,
      providesTags: ['Crypto']
    })
  })
});

export const {
  useGetETHPriceMutation,
  useGetSupportedTokensQuery,
  useCreateCryptoOrderMutation,
  useGetCryptoOrderByOrderIdQuery,
  useProcessCryptoPaymentMutation,
  useConfirmCryptoPaymentMutation,
  useUpdateCryptoOrderStatusMutation,
  useMarkCryptoOrderDeliveredMutation,
  useApproveCryptoOrderMutation,
  useDisputeCryptoOrderMutation,
  useCancelCryptoOrderMutation,
  useGetWalletBalanceQuery,
  useGetTransactionDetailsQuery,
  useGetCryptoOrdersByBuyerQuery,
  useGetCryptoOrdersBySellerQuery,
  useGetSellerWalletQuery
} = cryptoApi; 