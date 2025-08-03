import { Application } from 'express'
import { healthRoutes } from '@ai/routes/health.routes'
import { recommendationRoutes } from '@ai/routes/recommendation.routes'

const BASE_PATH = '/api/v1'

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes())
  app.use(BASE_PATH, recommendationRoutes())
}

export { appRoutes }