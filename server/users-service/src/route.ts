import { Application } from 'express'
import { verifyGatewayRequest } from 'jobber-shared-for-hkhanq'
import { buyerRoutes } from '@users/routes/buyer'
import { healthRoutes } from '@users/routes/health'
import { sellerRoutes } from '@users/routes/seller'
import { id } from '@users/controllers/seller/get'

const BUYER_BASE_PATH = '/api/v1/buyer'
const SELLER_BASE_PATH = '/api/v1/seller'
const INTERNAL_BASE_PATH = '/api/v1/internal'

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes())
  
  // Internal routes (no gateway middleware) for inter-service communication
  app.get(`${INTERNAL_BASE_PATH}/seller/id/:sellerId`, id)
  
  // Public routes (with gateway middleware)
  app.use(BUYER_BASE_PATH, verifyGatewayRequest, buyerRoutes())
  app.use(SELLER_BASE_PATH, verifyGatewayRequest, sellerRoutes())
}

export { appRoutes }