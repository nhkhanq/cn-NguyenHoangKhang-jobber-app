import {winstonLogger} from '@tanlan/jobber-shared'
import { Application, json, urlencoded } from 'express'
import { Logger } from 'winston'
import cookieSession from 'cookie-session'
import cors from 'cors'
import hpp from 'hpp'
import helmet from 'helmet'
import compression from 'compression'

const SERVER_PORT = 4000
const log: Logger = winstonLogger('', 'apiGatewayServer', 'debug')

export class GatewayServer {
    private app: Application

constructor(app: Application) {
    this.app = app
}

public start(): void {

}

private securityMiddleware( app: Application): void {
    app.set('trust proxy', 1)
    app.use(
        cookieSession({
            name: 'session',
            keys: [],
            maxAge: 24 * 7 * 3600000,
            secure: false,
            //sameSite: none 
        })
    )
    app.use(hpp())
    app.use(helmet())
    app.use(cors({
        origin: '',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }))
}

private standarMiddleware(app: Application): void {
    app.use(compression())
    app.use(json({ limit: '200mb' }))
    app.use(urlencoded({ extended: true ,limit: '200mb' }))
}

private routeMiddleware(app: Application): void {
    
}

private startElasticSearch(app: Application): void {
    
}

private errorHandler(app: Application): void {
}

}