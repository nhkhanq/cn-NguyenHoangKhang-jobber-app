import { Router } from 'express'
import { verifyGatewayRequest } from 'jobber-shared-for-hkhanq'
import { recommendationController } from '@ai/controllers/recommendation.controller'

const router = Router()

const recommendationRoutes = (): Router => {
  // Public routes (with gateway verification)
  router.post('/recommend', verifyGatewayRequest, recommendationController.recommendGigs)
  router.get('/suggestions', verifyGatewayRequest, recommendationController.getSuggestions)
  
  // Protected routes (require authentication)
  router.get('/history/:userId', verifyGatewayRequest, recommendationController.getRecommendationHistory)
  router.post('/feedback/:recommendationId', verifyGatewayRequest, recommendationController.provideFeedback)
  
  return router
}

export { recommendationRoutes }