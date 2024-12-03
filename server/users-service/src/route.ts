import { Application } from 'express'
import { verifyGatewayRequest } from 'jobber-shared-for-hkhanq'
import { buyerRoutes } from '@users/routes/buyer'
import { healthRoutes } from './routes/health'

const BUYER_BASE_PATH = '/api/v1/buyer'
const SELLER_BASE_PATH = '/api/v1/seller'

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes())
  app.use(BUYER_BASE_PATH, verifyGatewayRequest, buyerRoutes())
  app.use(SELLER_BASE_PATH, verifyGatewayRequest, () => {})
}

export { appRoutes }