import { Router } from 'express'
import { recommendationController } from '@ai/controllers/recommendation.controller'

const router = Router()

const healthRoutes = (): Router => {
  router.get('/ai-recommend-health', recommendationController.healthCheck)
  
  return router
}

export { healthRoutes }