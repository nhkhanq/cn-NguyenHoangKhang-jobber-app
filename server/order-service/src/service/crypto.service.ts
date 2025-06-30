import { config } from '@order/config'

class CryptoService {
  private baseURL: string

  constructor() {
    this.baseURL = `${config.CRYPTO_PAYMENT_BASE_URL}/api/v1/crypto`
  }

  async createCryptoOrder(orderData: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.JWT_TOKEN}`
      },
      body: JSON.stringify(orderData)
    })
    return response.json()
  }

  async getCryptoOrder(cryptoOrderId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/orders/${cryptoOrderId}`, {
      headers: {
        'Authorization': `Bearer ${config.JWT_TOKEN}`
      }
    })
    return response.json()
  }

  async confirmCryptoPayment(cryptoOrderId: string, transactionData: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/orders/${cryptoOrderId}/confirm-payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.JWT_TOKEN}`
      },
      body: JSON.stringify(transactionData)
    })
    return response.json()
  }

  async markCryptoOrderDelivered(cryptoOrderId: string, deliveryData: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/orders/${cryptoOrderId}/delivered`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.JWT_TOKEN}`
      },
      body: JSON.stringify(deliveryData)
    })
    return response.json()
  }

  async completeCryptoOrder(cryptoOrderId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/orders/${cryptoOrderId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.JWT_TOKEN}`
      },
      body: JSON.stringify({})
    })
    return response.json()
  }

  async cancelCryptoOrder(cryptoOrderId: string, reason: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/orders/${cryptoOrderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.JWT_TOKEN}`
      },
      body: JSON.stringify({ reason })
    })
    return response.json()
  }
}

export const cryptoService: CryptoService = new CryptoService() 