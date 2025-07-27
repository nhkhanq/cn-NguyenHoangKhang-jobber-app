import { AxiosService } from '@gateway/services/axios'
import { config } from '@gateway/config'
import axios, { AxiosResponse } from 'axios'

export let axiosCryptoInstance: ReturnType<typeof axios.create>

class CryptoService {
  constructor() {
    const axiosService: AxiosService = new AxiosService(`${config.CRYPTO_PAYMENT_BASE_URL}/api/v1/crypto`, 'crypto')
    axiosCryptoInstance = axiosService.axios
  }

  async getSupportedTokens(): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get('/tokens')
    return response
  }

  async getETHPrice(usdAmount: number): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/price?usdAmount=${usdAmount}`)
    return response
  }

  async getSellerWallet(sellerId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/sellers/${sellerId}/wallet`)
    return response
  }

  async createOrder(body: any): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.post('/orders', body)
    return response
  }

  async getOrder(orderId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/orders/${orderId}`)
    return response
  }

  async processPayment(orderId: string, body: { transactionHash: string; blockNumber: number }): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.post(`/orders/${orderId}/payment`, body)
    return response
  }

  async updateOrderStatus(orderId: string, body: { status: string; transactionHash?: string; blockNumber?: number }): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.put(`/orders/${orderId}/status`, body)
    return response
  }

  async completeOrder(orderId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.put(`/orders/${orderId}/complete`)
    return response
  }

  async getBalance(address: string, chainId: number): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/balance/${address}/${chainId}`)
    return response
  }

  async getTransactionDetails(txHash: string, chainId: number): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/transaction/${txHash}/${chainId}`)
    return response
  }

  async getOrdersByBuyer(buyerAddress: string, query: any): Promise<AxiosResponse> {
    const queryString = new URLSearchParams(query).toString()
    const response: AxiosResponse = await axiosCryptoInstance.get(`/buyers/${buyerAddress}/orders?${queryString}`)
    return response
  }

  async getCryptoOrdersByJobberOrderId(jobberOrderId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/orders/jobber/${jobberOrderId}`)
    return response
  }

  async markDelivered(orderId: string, body: any): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.put(`/orders/${orderId}/delivered`, body)
    return response
  }

  async raiseDispute(orderId: string, body: { reason: string; evidence?: string }): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.put(`/orders/${orderId}/dispute`, body)
    return response
  }

  async resolveDispute(orderId: string, body: { resolution: string; refundPercentage: number }): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.put(`/orders/${orderId}/resolve-dispute`, body)
    return response
  }

  async cancelOrder(orderId: string, body: { reason: string }): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.put(`/orders/${orderId}/cancel`, body)
    return response
  }

  async getOrdersBySeller(sellerAddress: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/orders/seller/${sellerAddress}`)
    return response
  }
}

export const cryptoService: CryptoService = new CryptoService() 