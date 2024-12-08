import { Application } from 'express'
import { verifyGatewayRequest } from 'jobber-shared-for-hkhanq'
import { gigRoutes } from '@gig/routes/gig'


const BASE_PATH = '/api/v1/gig'

const appRoutes = (app: Application): void => {
  // app.use('', healthRoutes())
  app.use(BASE_PATH, verifyGatewayRequest, gigRoutes())
}

export { appRoutes }