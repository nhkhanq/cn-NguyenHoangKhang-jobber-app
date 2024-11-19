import { Application } from 'express'
import { healthRoutes } from '@gateway/routes/healthy'
import { authRoutes } from '@gateway/routes/auth'

const BASE_URL = 'api/gateway/v1'

export const appRoutes = (app: Application) => {
    app.use('', healthRoutes.routes())
    app.use(BASE_URL, authRoutes.routes())
}