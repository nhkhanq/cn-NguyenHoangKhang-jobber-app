export interface IAIRecommendationRequest {
  query: string
  budget?: number
  category?: string
  deliveryTime?: string
  location?: string
  userId?: string | undefined
}

export interface IAIGigMatch {
  gigId: string
  title: string
  description: string
  basicTitle: string
  basicDescription: string
  username: string
  profilePicture: string
  coverImage: string
  price: number
  similarity: number
  explanation: string
  reasons: string[]
  confidence: number
  categories: string[]
  tags: string[]
  ratingsCount?: number
  ratingSum?: number
  sellerId: string
  active?: boolean
}

export interface IAIRecommendationResponse {
  matches: IAIGigMatch[]
  totalFound: number
  processingTime: number
  suggestions?: string[]
}

export interface IAISearchSuggestion {
  query: string
  category?: string
  popularity?: number
}

export interface IAIRecommendationHistory {
  id: string
  query: string
  results: IAIGigMatch[]
  timestamp: string
  feedback?: {
    helpful: boolean
    rating: number
    comment?: string
  }
}

export interface IAIFeedbackRequest {
  recommendationId: string
  helpful: boolean
  rating?: number
  comment?: string
}