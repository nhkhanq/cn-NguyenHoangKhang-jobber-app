export interface IAIRecommendationRequest {
  query: string;
  userId?: string;
  maxResults?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  deliveryTime?: string;
}

export interface IAIRecommendationResponse {
  matches: IGigRecommendation[];
  totalFound: number;
  query: string;
  processingTime: number;
  intent?: string;
  suggestions?: string[];
}

// Alias for compatibility
export interface IRecommendationResponse extends IAIRecommendationResponse {}

export interface IGigMatch {
  gigId: string;
  title: string;
  description: string;
  basicTitle: string;
  basicDescription: string;
  username: string;
  profilePicture: string;
  price: number;
  similarity: number;
  explanation: string;
  confidence: number;
  categories: string[];
  tags: string[];
  reasons?: string[];
}

export interface IAISearchIntent {
  mainKeywords: string[];
  keywords: string[];
  category: string;
  budget?: {
    min?: number;
    max?: number;
  };
  deliveryTime?: string;
  location?: string;
  experience?: string;
  skills: string[];
  urgency?: 'low' | 'medium' | 'high';
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface IGigRecommendation {
  gigId: string;
  title: string;
  description: string;
  basicTitle: string;
  basicDescription: string;
  username: string;
  profilePicture: string;
  price: number;
  similarity: number;
  explanation: string;
  confidence: number;
  categories: string[];
  tags: string[];
}

export interface IGigSimilarity {
  gigId: string;
  embedding: number[];
  lastUpdated: Date;
}

export interface IRecommendationHistory {
  userId: string;
  query: string;
  recommendations: IGigRecommendation[];
  createdAt: Date;
  feedback?: {
    rating: number;
    comment?: string;
  };
}

export interface IGigSearchParams {
  query: string;
  from: number;
  size: number;
  type: string;
  minprice?: number;
  maxprice?: number;
  category?: string;
}