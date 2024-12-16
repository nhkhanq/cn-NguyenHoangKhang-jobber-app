import { health } from '@chat/controller/health'
import express, { Router } from 'express'

const router: Router = express.Router()

const healthRoutes = (): Router => {
  router.get('/chat-health', health)

  return router
}

export { healthRoutes }