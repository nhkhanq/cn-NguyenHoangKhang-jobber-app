import { Application } from 'express'
import { healthRoutes } from '@gateway/routes/healthy'

export const appRoutes = (app: Application) => {
    app.use('', healthRoutes.routes())
}