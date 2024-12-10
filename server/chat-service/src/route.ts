import { Application } from 'express'
import { verifyGatewayRequest } from 'jobber-shared-for-hkhanq'
// import { gigRoutes } from '@chat/routes/chat'
// import { healthRoutes } from '@chat/routes/health'


const BASE_PATH = '/api/v1/chat'

const appRoutes = (app: Application): void => {
  app.use('', ()=>{})
  app.use(BASE_PATH, verifyGatewayRequest, ()=> {})
}

export { appRoutes }