import axios, { AxiosResponse } from 'axios'
import { config } from '@ai/config'
import { Logger } from 'winston'
import { ISellerGig, IAuthPayload } from 'jobber-shared-for-hkhanq'
import { createLogger } from '@ai/logger'
import { sign } from 'jsonwebtoken'

const log: Logger = createLogger('aiRecommendServiceGig')

interface IGigSearchParams {
  category?: string
  minPrice?: number
  maxPrice?: number
  deliveryTime?: string
  searchTerm?: string
  limit?: number
  skip?: number
}

class GigService {
  private baseURL: string

  constructor() {
    this.baseURL = config.GIG_SERVICE_URL!
  }

  private generateGatewayToken(): string {
    if (!config.GATEWAY_JWT_TOKEN) {
      throw new Error('GATEWAY_JWT_TOKEN is not configured')
    }
    // Generate gateway token with 'ai' service ID (like Gateway does)
    return sign({ id: 'search' }, config.GATEWAY_JWT_TOKEN)
  }

  async searchGigs(params: IGigSearchParams): Promise<ISellerGig[]> {
    try {
      const queryParams = new URLSearchParams()
      
      // Map AI Service params to Gig Service API format
      if (params.searchTerm) {
        queryParams.append('query', params.searchTerm)
      } else {
        queryParams.append('query', '*') // Default to wildcard search
      }
      
      if (params.minPrice) queryParams.append('minprice', params.minPrice.toString())
      if (params.maxPrice) queryParams.append('maxprice', params.maxPrice.toString())
      if (params.deliveryTime) queryParams.append('delivery_time', params.deliveryTime)

      const headers: any = {
        'Content-Type': 'application/json',
        'gatewaytoken': this.generateGatewayToken()
      }

      const from = params.skip || 0
      const size = params.limit || 50
      const type = 'forward'
      
      const response: AxiosResponse = await axios.get(
        `${this.baseURL}/api/v1/gig/search/${from}/${size}/${type}?${queryParams.toString()}`,
        { headers }
      )

      if (response.data && response.data.gigs) {
        return response.data.gigs as ISellerGig[]
      }

      return []
    } catch (error) {
      log.error('Error searching gigs:', error)
      return []
    }
  }

  async getGigById(gigId: string): Promise<ISellerGig | null> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseURL}/api/v1/gig/${gigId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'gatewaytoken': this.generateGatewayToken()
          }
        }
      )

      return response.data.gig as ISellerGig
    } catch (error) {
      log.error(`Error getting gig ${gigId}:`, error)
      return null
    }
  }

  async getGigsByCategory(category: string, limit = 50): Promise<ISellerGig[]> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseURL}/api/v1/gig/category/${category}?size=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'gatewaytoken': this.generateGatewayToken()
          }
        }
      )

      if (response.data && response.data.gigs) {
        return response.data.gigs as ISellerGig[]
      }

      return []
    } catch (error) {
      log.error(`Error getting gigs for category ${category}:`, error)
      return []
    }
  }

  async getAllActiveGigs(limit = 100, skip = 0): Promise<ISellerGig[]> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'gatewaytoken': this.generateGatewayToken()
      }

      const type = 'forward'
      
      const response: AxiosResponse = await axios.get(
        `${this.baseURL}/api/v1/gig/search/${skip}/${limit}/${type}?query=*`,
        { headers }
      )

      if (response.data && response.data.gigs) {
        return response.data.gigs as ISellerGig[]
      }

      return []
    } catch (error) {
      log.error('Error getting all gigs:', error)
      return []
    }
  }

  buildGigSearchText(gig: ISellerGig): string {
    const parts = [
      gig.title,
      gig.basicTitle,
      gig.description,
      gig.basicDescription,
      gig.categories,
      gig.subCategories?.join(' '),
      gig.tags?.join(' ')
    ].filter(Boolean)

    return parts.join(' ').replace(/\s+/g, ' ').trim()
  }
}

export const gigService = new GigService()