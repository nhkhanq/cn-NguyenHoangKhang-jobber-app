import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AxiosResponse } from 'axios'
import { winstonLogger } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'
import { aiService } from '@gateway/services/api/ai.service'

const log: Logger = winstonLogger(`${process.env.ELASTIC_SEARCH_URL}`, 'gatewayAIRecommendController', 'debug')

class AIRecommendationController {
  async recommendGigs(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await aiService.recommendGigs(req.body)

      res.status(StatusCodes.OK).json({
        message: response.data.message,
        data: response.data.data
      })
    } catch (error: any) {
      log.error(`Error in recommendGigs gateway: ${error.message}`, error.stack)
      
      if (error.response) {
        res.status(error.response.status).json({
          message: error.response.data.message || 'AI recommendation service error',
          error: error.response.data.error
        })
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'AI recommendation service is unavailable',
          error: error.message
        })
      }
    }
  }

  async getRecommendationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const queryParams = new URLSearchParams(req.query as Record<string, string>)

      const response: AxiosResponse = await aiService.getRecommendationHistory(userId, queryParams.toString())

      res.status(StatusCodes.OK).json({
        message: response.data.message,
        data: response.data.data
      })
    } catch (error: any) {
      log.error(`Error in getRecommendationHistory gateway: ${error.message}`, error.stack)
      
      if (error.response) {
        res.status(error.response.status).json({
          message: error.response.data.message || 'AI recommendation service error'
        })
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'AI recommendation service is unavailable'
        })
      }
    }
  }

  async provideFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { recommendationId } = req.params

      const response: AxiosResponse = await aiService.provideFeedback(recommendationId, req.body)

      res.status(StatusCodes.OK).json({
        message: response.data.message
      })
    } catch (error: any) {
      log.error(`Error in provideFeedback gateway: ${error.message}`, error.stack)
      
      if (error.response) {
        res.status(error.response.status).json({
          message: error.response.data.message || 'AI recommendation service error'
        })
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'AI recommendation service is unavailable'
        })
      }
    }
  }

  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.query as string

      const response: AxiosResponse = await aiService.getSuggestions(query || '')

      res.status(StatusCodes.OK).json({
        message: response.data.message,
        data: response.data.data
      })
    } catch (error: any) {
      log.error(`Error in getSuggestions gateway: ${error.message}`, error.stack)
      
      if (error.response) {
        res.status(error.response.status).json({
          message: error.response.data.message || 'AI recommendation service error'
        })
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'AI recommendation service is unavailable'
        })
      }
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const response: AxiosResponse = await aiService.healthCheck()

      res.status(StatusCodes.OK).json({
        message: 'AI recommendation service is healthy',
        data: response.data
      })
    } catch (error: any) {
      log.error(`Error in AI recommendation health check: ${error.message}`, error.stack)
      
      res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        message: 'AI recommendation service is unavailable',
        error: error.message
      })
    }
  }
}

export const aiRecommendationController = new AIRecommendationController()