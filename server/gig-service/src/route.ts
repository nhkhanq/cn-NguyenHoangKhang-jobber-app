import { Application } from 'express'
import { verifyGatewayRequest } from 'jobber-shared-for-hkhanq'
// import { buyerRoutes } from '@gig/routes/buyer'
// import { healthRoutes } from '@gig/routes/health'
// import { sellerRoutes } from '@gig/routes/seller'

const BASE_PATH = '/api/v1/gig'

const appRoutes = (app: Application): void => {
  // app.use('', healthRoutes())
  // app.use(BUYER_BASE_PATH, verifyGatewayRequest, buyerRoutes())
  // app.use(SELLER_BASE_PATH, verifyGatewayRequest, sellerRoutes())
}

export { appRoutes }