import { useState, useCallback } from 'react'
import { useGetAIRecommendationsMutation } from '../services/ai-recommendation.service'
import { IAIRecommendationRequest, IAIRecommendationResponse } from '../interfaces/ai-recommendation.interface'
import { useAppSelector } from 'src/store/store'
import { IReduxState } from 'src/store/store.interface'

export const useAIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<IAIRecommendationResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const authUser = useAppSelector((state: IReduxState) => state.authUser)
  const [getRecommendations] = useGetAIRecommendationsMutation()

  const searchRecommendations = useCallback(async (request: Omit<IAIRecommendationRequest, 'userId'>) => {
    if (isSearching) return

    setIsSearching(true)
    setError(null)

    try {
      const fullRequest: IAIRecommendationRequest = {
        ...request,
        userId: authUser.id?.toString()
      }

      const result = await getRecommendations(fullRequest).unwrap()
      
      if (result) {
        const response = (result as any)?.data || result;
        setRecommendations(response as IAIRecommendationResponse)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while getting recommendations')
      console.error('AI recommendation error:', err)
    } finally {
      setIsSearching(false)
    }
  }, [authUser.id, getRecommendations, isSearching])

  const clearRecommendations = useCallback(() => {
    setRecommendations(null)
    setError(null)
  }, [])

  return {
    recommendations,
    isSearching,
    error,
    searchRecommendations,
    clearRecommendations
  }
}