import { verifyGatewayRequest } from 'jobber-shared-for-hkhanq'
import { Application } from 'express'
// import { healthRoutes } from '@review/routes/health'
// import { orderRoutes } from '@review/routes/order'


const BASE_PATH = '/api/v1/review'

const appRoutes = (app: Application): void => {
  app.use('',  () => {})
  app.use(BASE_PATH, verifyGatewayRequest, () => {})
}

export { appRoutes }