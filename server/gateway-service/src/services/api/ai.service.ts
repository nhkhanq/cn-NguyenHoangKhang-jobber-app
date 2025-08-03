import axios, { AxiosResponse } from 'axios'
import { AxiosService } from '@gateway/services/axios'
import { config } from '@gateway/config'

export let axiosAIInstance: ReturnType<typeof axios.create>

class AIService {
  axiosService: AxiosService

  constructor() {
    this.axiosService = new AxiosService(`${config.AI_RECOMMEND_SERVICE_URL || 'http://localhost:4009'}/api/v1`, 'search')
    axiosAIInstance = this.axiosService.axios
  }

  async recommendGigs(data: any): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAIInstance.post('/recommend', data)
    return response
  }

  async getSuggestions(query: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAIInstance.get(`/suggestions?query=${encodeURIComponent(query)}`)
    return response
  }

  async getRecommendationHistory(userId: string, queryParams?: string): Promise<AxiosResponse> {
    const url = queryParams ? `/history/${userId}?${queryParams}` : `/history/${userId}`
    const response: AxiosResponse = await axiosAIInstance.get(url)
    return response
  }

  async provideFeedback(recommendationId: string, data: any): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAIInstance.post(`/feedback/${recommendationId}`, data)
    return response
  }

  async healthCheck(): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAIInstance.get('/../ai-recommend-health')
    return response
  }
}

export const aiService: AIService = new AIService()