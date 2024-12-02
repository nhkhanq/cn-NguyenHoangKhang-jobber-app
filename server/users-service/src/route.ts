import { Application } from 'express'
import { verifyGatewayRequest } from 'jobber-shared-for-hkhanq'

const BUYER_BASE_PATH = '/api/v1/buyer'
const SELLER_BASE_PATH = '/api/v1/seller'

const appRoutes = (app: Application): void => {
  app.use('', () => {})
  app.use(BUYER_BASE_PATH, verifyGatewayRequest, () => {})
  app.use(SELLER_BASE_PATH, verifyGatewayRequest, () => {})
}

export { appRoutes }