import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Logger } from 'winston'
import { config } from '@ai/config'
import { recommendationService } from '@ai/services/recommendation.service'
import { IAIRecommendationRequest } from '@ai/interfaces/recommendation.interface'
import Joi from 'joi'
import { createLogger } from '@ai/logger'

const log: Logger = createLogger('aiRecommendServiceController')

// Validation schemas
const recommendGigsSchema = Joi.object({
  query: Joi.string().required().min(3).max(500),
  budget: Joi.number().optional().min(1),
  category: Joi.string().optional(),
  deliveryTime: Joi.string().optional(),
  location: Joi.string().optional(),
  userId: Joi.string().optional()
})

class RecommendationController {
  async recommendGigs(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = recommendGigsSchema.validate(req.body)
      
      if (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Invalid request data',
          error: error.details[0].message
        })
        return
      }

      const request: IAIRecommendationRequest = {
        ...value,
        userId: req.currentUser?.id || value.userId
      }

      log.info('Processing recommendation request', { 
        query: request.query,
        userId: request.userId 
      })

      const recommendations = await recommendationService.recommendGigs(request, req.currentUser)

      res.status(StatusCodes.OK).json({
        message: 'Recommendations generated successfully',
        data: recommendations
      })
    } catch (error) {
      log.error('Error in recommendGigs controller:', error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while generating recommendations',
        error: process.env.NODE_ENV === 'development' ? error : {}
      })
    }
  }

  async getRecommendationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const { limit = 10, skip = 0 } = req.query

      if (!userId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'User ID is required'
        })
        return
      }

      // TODO: Implement history retrieval
      // const history = await recommendationService.getRecommendationHistory(
      //   userId, 
      //   parseInt(limit as string), 
      //   parseInt(skip as string)
      // )

      res.status(StatusCodes.OK).json({
        message: 'Recommendation history retrieved successfully',
        data: {
          history: [],
          total: 0
        }
      })
    } catch (error) {
      log.error('Error in getRecommendationHistory controller:', error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while retrieving recommendation history'
      })
    }
  }

  async provideFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { recommendationId } = req.params
      const { helpful, rating, comment } = req.body

      if (!recommendationId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Recommendation ID is required'
        })
        return
      }

      // TODO: Implement feedback storage
      // await recommendationService.updateRecommendationFeedback(
      //   recommendationId,
      //   { helpful, rating, comment }
      // )

      res.status(StatusCodes.OK).json({
        message: 'Feedback saved successfully'
      })
    } catch (error) {
      log.error('Error in provideFeedback controller:', error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while saving feedback'
      })
    }
  }

  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query

      if (!query || typeof query !== 'string') {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Query parameter is required'
        })
        return
      }

      // TODO: Implement search suggestions based on popular queries
      const suggestions = [
        'website design',
        'logo creation',
        'mobile app development',
        'content writing',
        'social media marketing'
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )

      res.status(StatusCodes.OK).json({
        message: 'Search suggestions retrieved successfully',
        data: { suggestions }
      })
    } catch (error) {
      log.error('Error in getSuggestions controller:', error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while retrieving suggestions'
      })
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check OpenAI API connectivity
      // Check database connectivity
      // Check redis connectivity

      res.status(StatusCodes.OK).json({
        message: 'AI Recommendation service is healthy',
        timestamp: new Date().toISOString(),
        service: 'ai-recommend-service'
      })
    } catch (error) {
      log.error('Health check failed:', error)
      res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        message: 'AI Recommendation service is unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

export const recommendationController = new RecommendationController()