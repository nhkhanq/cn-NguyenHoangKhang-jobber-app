import { Logger } from 'winston'
import { config } from '@ai/config'
import { createLogger } from '@ai/logger'
import { 
  IAIRecommendationRequest, 
  IRecommendationResponse, 
  IGigMatch,
  IAISearchIntent 
} from '@ai/interfaces/recommendation.interface'
import { openAIService } from '@ai/services/openai.service'
import { gigService } from '@ai/services/gig.service'
import { GigSimilarityModel, RecommendationHistoryModel } from '@ai/models/recommendation.schema'
import { redisConnection } from '@ai/redis/redis.connection'
import { ISellerGig, IAuthPayload } from 'jobber-shared-for-hkhanq'
import crypto from 'crypto'

const log: Logger = createLogger('aiRecommendServiceRecommendation')

class RecommendationService {
  private readonly SIMILARITY_THRESHOLD = 0.1 // Lowered for better text matching
  private readonly MAX_RESULTS = 10
  private readonly CACHE_TTL = 3600 // 1 hour in seconds

  async recommendGigs(request: IAIRecommendationRequest, user?: IAuthPayload): Promise<IRecommendationResponse> {
    const startTime = Date.now()
    
    try {
      log.info('Processing gig recommendation request', { query: request.query })

      // 1. Check cache first
      const cachedResult = await this.getCachedRecommendation(request)
      if (cachedResult) {
        return cachedResult
      }

      // 2. Extract search intent using AI
      const intent = await openAIService.extractSearchIntent(request.query)
      log.info('Search intent extracted', { intent })

      // 3. Get candidate gigs
      const candidateGigs = await this.getCandidateGigs(intent, request)
      
      if (candidateGigs.length === 0) {
        return {
          matches: [],
          totalFound: 0,
          query: request.query,
          processingTime: Date.now() - startTime,
          suggestions: ['Try different keywords', 'Consider broader search terms']
        }
      }

      // 4. Generate query embedding
      const queryEmbedding = await openAIService.generateEmbedding(request.query)

      // 5. Calculate similarities and rank
      const matches = await this.calculateSimilarities(candidateGigs, queryEmbedding, intent, request)

      // 6. Filter and sort results
      const filteredMatches = matches
        .filter(match => match.similarity >= this.SIMILARITY_THRESHOLD)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, this.MAX_RESULTS)

      const response: IRecommendationResponse = {
        matches: filteredMatches,
        totalFound: matches.length,
        query: request.query,
        processingTime: Date.now() - startTime,
        suggestions: this.generateSearchSuggestions(intent, filteredMatches.length)
      }

      // 7. Cache the result
      await this.cacheRecommendation(request, response)

      // 8. Save to history if user provided
      if (request.userId) {
        await this.saveRecommendationHistory(request, response)
      }

      log.info('Recommendation completed', { 
        matchesFound: filteredMatches.length,
        processingTime: response.processingTime 
      })

      return response
    } catch (error) {
      log.error('Error in recommendGigs:', error)
      throw error
    }
  }

  private async getCandidateGigs(intent: IAISearchIntent, request: IAIRecommendationRequest): Promise<ISellerGig[]> {
    const searchParams = {
      category: intent.category !== 'General' ? intent.category : request.category,
      minPrice: intent.budget?.min || (request.budget?.min ? Math.max(0, request.budget.min * 0.7) : request.minPrice),
      maxPrice: intent.budget?.max || (request.budget?.max ? request.budget.max * 1.3 : request.maxPrice),
      searchTerm: intent.keywords.join(' '),
      limit: 50
    }

    let gigs = await gigService.searchGigs(searchParams)

    // Fallback: if no results, try broader search
    if (gigs.length === 0 && intent.category !== 'General') {
      log.info('No results found, trying broader search')
      gigs = await gigService.searchGigs({
        searchTerm: intent.keywords.slice(0, 3).join(' '),
        limit: 30
      })
    }

    // Final fallback: get popular gigs from same category
    if (gigs.length === 0) {
      log.info('Still no results, getting popular gigs')
      gigs = await gigService.getAllActiveGigs(20, 0)
    }

    // Filter active gigs with good ratings
    return gigs.filter(gig => 
      gig.active !== false && 
      (gig.ratingsCount === undefined || gig.ratingsCount === 0 || 
       (gig.ratingSum && gig.ratingsCount && gig.ratingSum / gig.ratingsCount >= 4.0))
    )
  }

  private async calculateSimilarities(
    gigs: ISellerGig[], 
    queryEmbedding: number[], 
    intent: IAISearchIntent,
    request: IAIRecommendationRequest
  ): Promise<IGigMatch[]> {
    const matches: IGigMatch[] = []

    for (const gig of gigs) {
      try {
        // Get or create gig embedding
        const gigEmbedding = await this.getGigEmbedding(gig)
        
        // Calculate semantic similarity (or text-based for development)
        let similarity = openAIService.cosineSimilarity(queryEmbedding, gigEmbedding)
        
        // DEVELOPMENT MODE: Use text-based similarity for better results
        if (config.USE_OPENAI !== 'true') {
          similarity = this.calculateTextSimilarity(request.query, gig, intent)
        }
        
        // Calculate additional scoring factors
        const reasons = this.generateMatchReasons(gig, intent, request)
        const adjustedSimilarity = this.adjustSimilarityScore(similarity, gig, intent, request)
        
        // Only include gigs with reasonable similarity (skip very poor matches)
        if (adjustedSimilarity < 0.1) {
          continue
        }
        
        // Generate explanation
        const explanation = await openAIService.generateGigExplanation(
          gig.title,
          gig.description,
          request.query,
          adjustedSimilarity,
          reasons
        )

        matches.push({
          gigId: gig._id?.toString() || gig.id?.toString() || '',
          title: gig.title || '',
          description: gig.description || '',
          basicTitle: gig.basicTitle || '',
          basicDescription: gig.basicDescription || '',
          username: gig.username || '',
          profilePicture: gig.profilePicture || '',
          price: gig.price || 0,
          similarity: adjustedSimilarity,
          explanation,
          confidence: this.calculateConfidence(adjustedSimilarity, reasons.length),
          categories: Array.isArray(gig.categories) ? gig.categories : [gig.categories || ''],
          tags: Array.isArray(gig.tags) ? gig.tags : [],
          reasons
        })
      } catch (error) {
        log.error(`Error calculating similarity for gig ${gig._id}:`, error)
        continue
      }
    }

    return matches
  }

  private async getGigEmbedding(gig: ISellerGig): Promise<number[]> {
    const gigId = gig._id?.toString() || gig.id?.toString()
    if (!gigId) {
      throw new Error('Gig ID is required')
    }

    // Check if we have cached embedding
    const cached = await GigSimilarityModel.findOne({ gigId })
    
    if (cached && this.isEmbeddingFresh(cached.lastUpdated)) {
      return cached.embedding
    }

    // Generate new embedding
    const gigText = gigService.buildGigSearchText(gig)
    const embedding = await openAIService.generateEmbedding(gigText)

    // Cache the embedding
    await GigSimilarityModel.findOneAndUpdate(
      { gigId },
      { 
        gigId,
        embedding,
        lastUpdated: new Date()
      },
      { upsert: true }
    )

    return embedding
  }

  private isEmbeddingFresh(lastUpdated: Date): boolean {
    const oneWeek = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds
    return Date.now() - lastUpdated.getTime() < oneWeek
  }

  private generateMatchReasons(gig: ISellerGig, intent: IAISearchIntent, request: IAIRecommendationRequest): string[] {
    const reasons: string[] = []

    // Category match
    if (intent.category !== 'General' && gig.categories?.toLowerCase().includes(intent.category.toLowerCase())) {
      reasons.push('Category match')
    }

    // Skill match
    const gigSkills = [
      ...gig.tags || [],
      ...gig.subCategories || []
    ].map(s => s.toLowerCase())
    
    const intentSkills = intent.skills.map(s => s.toLowerCase())
    const skillMatches = intentSkills.filter(skill => 
      gigSkills.some(gigSkill => gigSkill.includes(skill) || skill.includes(gigSkill))
    )
    
    if (skillMatches.length > 0) {
      reasons.push('Skill match')
    }

    // Budget match
    if (request.budget?.max && gig.price <= request.budget.max * 1.1) {
      reasons.push('Budget fit')
    }

    // High rating
    if (gig.ratingsCount && gig.ratingSum && gig.ratingsCount > 5) {
      const avgRating = gig.ratingSum / gig.ratingsCount
      if (avgRating >= 4.5) {
        reasons.push('Highly rated')
      }
    }

    // Delivery time match
    if (request.deliveryTime && gig.expectedDelivery) {
      const requestedDays = this.parseDeliveryTime(request.deliveryTime)
      const gigDays = this.parseDeliveryTime(gig.expectedDelivery)
      
      if (gigDays && requestedDays && gigDays <= requestedDays) {
        reasons.push('Fast delivery')
      }
    }

    return reasons
  }

  private adjustSimilarityScore(
    baseSimilarity: number, 
    gig: ISellerGig, 
    intent: IAISearchIntent, 
    request: IAIRecommendationRequest
  ): number {
    let adjustedScore = baseSimilarity

    // Boost for high ratings
    if (gig.ratingsCount && gig.ratingSum && gig.ratingsCount > 3) {
      const avgRating = gig.ratingSum / gig.ratingsCount
      adjustedScore += (avgRating - 3) * 0.05 // Boost up to 0.1 for 5-star
    }

    // Boost for budget match
    if (request.budget?.max && gig.price <= request.budget.max) {
      adjustedScore += 0.05
    }

    // Penalty for price too high
    if (request.budget?.max && gig.price > request.budget.max * 1.5) {
      adjustedScore -= 0.1
    }

    // Boost for category match
    if (intent.category !== 'General' && gig.categories?.toLowerCase().includes(intent.category.toLowerCase())) {
      adjustedScore += 0.1
    }

    return Math.min(1.0, Math.max(0.0, adjustedScore))
  }

  private calculateConfidence(similarity: number, reasonsCount: number): number {
    const baseConfidence = similarity
    const reasonsBoost = Math.min(0.2, reasonsCount * 0.05)
    return Math.min(1.0, baseConfidence + reasonsBoost)
  }

  private parseDeliveryTime(deliveryTime: string): number | null {
    const match = deliveryTime.match(/(\d+)/)
    return match ? parseInt(match[1]) : null
  }

  private generateSearchSuggestions(intent: IAISearchIntent, resultsCount: number): string[] {
    const suggestions: string[] = []

    if (resultsCount === 0) {
      suggestions.push('Try using different keywords')
      suggestions.push('Consider expanding your budget range')
      suggestions.push('Look for similar services in related categories')
    } else if (resultsCount < 3) {
      suggestions.push('Try broader search terms')
      suggestions.push('Consider similar service categories')
    }

    if (intent.budget) {
      suggestions.push('Consider adjusting your budget for more options')
    }

    return suggestions
  }

  private async getCachedRecommendation(request: IAIRecommendationRequest): Promise<IRecommendationResponse | null> {
    try {
      const cacheKey = this.generateCacheKey(request)
      const cached = await redisConnection.client.get(cacheKey)
      
      if (cached) {
        log.info('Returning cached recommendation')
        return JSON.parse(cached) as IRecommendationResponse
      }
    } catch (error) {
      log.error('Error getting cached recommendation:', error)
    }
    
    return null
  }

  private async cacheRecommendation(request: IAIRecommendationRequest, response: IRecommendationResponse): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(request)
      await redisConnection.client.setEx(
        cacheKey,
        this.CACHE_TTL,
        JSON.stringify(response)
      )
    } catch (error) {
      log.error('Error caching recommendation:', error)
    }
  }

  private generateCacheKey(request: IAIRecommendationRequest): string {
    const keyData = {
      query: request.query,
      budget: request.budget,
      category: request.category,
      deliveryTime: request.deliveryTime
    }
    
    return `ai_recommend:${crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex')}`
  }

  private async saveRecommendationHistory(
    request: IAIRecommendationRequest, 
    response: IRecommendationResponse
  ): Promise<void> {
    try {
      await RecommendationHistoryModel.create({
        userId: request.userId,
        query: request.query,
        results: response.matches,
        timestamp: new Date()
      })
    } catch (error) {
      log.error('Error saving recommendation history:', error)
    }
  }

  private calculateTextSimilarity(query: string, gig: ISellerGig, intent: IAISearchIntent): number {
    const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2)
    const gigText = `${gig.title || ''} ${gig.description || ''} ${gig.basicTitle || ''} ${gig.basicDescription || ''} ${gig.categories || ''} ${gig.subCategories || ''} ${(gig.tags || []).join(' ')}`.toLowerCase()
    
    // Calculate keyword overlap
    let matchCount = 0
    let totalWords = queryWords.length
    
    if (totalWords === 0) return 0
    
    for (const word of queryWords) {
      if (gigText.includes(word)) {
        matchCount++
      }
    }
    
    // Base similarity from keyword overlap
    let similarity = matchCount / totalWords
    
    // Boost for category match
    if (intent.category !== 'General' && gigText.includes(intent.category.toLowerCase())) {
      similarity += 0.3
    }
    
    // Boost for exact keyword matches in title (higher weight)
    const titleText = (gig.title || '').toLowerCase()
    for (const keyword of intent.keywords) {
      if (titleText.includes(keyword.toLowerCase())) {
        similarity += 0.4 // Strong boost for title matches
      } else if (gigText.includes(keyword.toLowerCase())) {
        similarity += 0.2 // Moderate boost for description matches
      }
    }
    
    log.info(`Text similarity for "${gig.title}": ${similarity.toFixed(2)} (matched ${matchCount}/${totalWords} words)`)
    
    return Math.min(similarity, 1.0) // Cap at 100%
  }
}

export const recommendationService = new RecommendationService()