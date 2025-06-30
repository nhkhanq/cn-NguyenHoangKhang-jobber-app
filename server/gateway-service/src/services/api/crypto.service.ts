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

  async getWalletBalance(walletAddress: string, chainId: number): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/balance/${walletAddress}/${chainId}`)
    return response
  }

  async createCryptoOrder(body: any): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.post('/orders', body)
    return response
  }

  async getCryptoOrder(orderId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/orders/${orderId}`)
    return response
  }

  async getCryptoOrdersByJobberOrderId(jobberOrderId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/orders/jobber/${jobberOrderId}`)
    return response
  }

  async confirmPayment(orderId: string, body: { transactionHash: string; blockNumber: number }): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.put(`/orders/${orderId}/confirm-payment`, body)
    return response
  }

  async markDelivered(orderId: string, body: any): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.put(`/orders/${orderId}/delivered`, body)
    return response
  }

  async completeOrder(orderId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.put(`/orders/${orderId}/complete`)
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

  async getOrdersByBuyer(buyerAddress: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/orders/buyer/${buyerAddress}`)
    return response
  }

  async getOrdersBySeller(sellerAddress: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosCryptoInstance.get(`/orders/seller/${sellerAddress}`)
    return response
  }
}

export const cryptoService: CryptoService = new CryptoService() 