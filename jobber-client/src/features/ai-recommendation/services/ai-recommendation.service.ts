import { IResponse } from 'src/shared/shared.interface'
import { api } from 'src/store/api'

import { 
  IAIRecommendationRequest, 
  IAIRecommendationResponse,
  IAISearchSuggestion,
  IAIRecommendationHistory,
  IAIFeedbackRequest
} from '../interfaces/ai-recommendation.interface'

export const aiRecommendationApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Get AI-powered gig recommendations
    getAIRecommendations: build.mutation<IResponse, IAIRecommendationRequest>({
      query: (body: IAIRecommendationRequest) => ({
        url: 'ai/recommend',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Search']
    }),

    // Get search suggestions  
    getAISearchSuggestions: build.query<IResponse, string>({
      query: (query: string) => `ai/recommend/suggestions?query=${encodeURIComponent(query)}`,
      providesTags: ['Search']
    }),

    // Get recommendation history for user
    getRecommendationHistory: build.query<IResponse, { userId: string; limit?: number; skip?: number }>({
      query: ({ userId, limit = 10, skip = 0 }) => 
        `ai/recommend/history/${userId}?limit=${limit}&skip=${skip}`,
      providesTags: ['Search']
    }),

    // Provide feedback on recommendation
    provideFeedback: build.mutation<IResponse, IAIFeedbackRequest>({
      query: ({ recommendationId, ...feedback }) => ({
        url: `ai/recommend/feedback/${recommendationId}`,
        method: 'POST',
        body: feedback
      }),
      invalidatesTags: ['Search']
    }),

    // Health check for AI service
    checkAIHealth: build.query<IResponse, void>({
      query: () => 'ai/recommend/health'
    })
  })
})

export const {
  useGetAIRecommendationsMutation,
  useGetAISearchSuggestionsQuery,
  useGetRecommendationHistoryQuery,
  useProvideFeedbackMutation,
  useCheckAIHealthQuery
} = aiRecommendationApi