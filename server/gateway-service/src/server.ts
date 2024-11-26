import http from 'http'

import 'express-async-errors'
import { CustomError, IErrorResponse, winstonLogger } from 'jobber-shared-for-hkhanq'
import { Application, Request, Response, json, urlencoded, NextFunction } from 'express'
import { Logger } from 'winston'
import cookieSession from 'cookie-session'
import cors from 'cors'
import hpp from 'hpp'
import helmet from 'helmet'
import compression from 'compression'
import { StatusCodes } from 'http-status-codes'
import { config } from '@gateway/config'
import { elasticSearch } from '@gateway/elasticsearch'
import { authRoutes } from '@gateway/routes/auth'
import { axiosAuthInstance } from '@gateway/services/api/auth.service'
import { isAxiosError } from 'axios'
import { searchRoutes } from '@gateway/routes/search'


const SERVER_PORT = 4000
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'apiGatewayServer', 'debug')

export class GatewayServer {
    private app: Application

    constructor(app: Application) {
        this.app = app
    }

    public start(): void {
        this.securityMiddleware(this.app)
        this.standarMiddleware(this.app)
        this.routeMiddleware(this.app)
        this.startElasticSearch(this.app)
        this.errorHandler(this.app)
        this.startServer(this.app)
    }

    private securityMiddleware(app: Application): void {
        app.set('trust proxy', 1)
        app.use(
            cookieSession({
                name: 'session',
                keys: [`${config.SECRET_KEY_ONE}, ${config.SECRET_KEY_TWO}`],
                maxAge: 24 * 7 * 3600000,
                secure: config.NODE_ENV !== '',
                //sameSite: 'none'
            })
        )
        app.use(hpp())
        app.use(helmet())
        app.use(cors({
            origin: '',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }))

    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`
      }
      next()
    })
  }

  private standarMiddleware(app: Application): void {
    app.use(compression())
    app.use(json({ limit: '200mb' }))
    app.use(urlencoded({ extended: true, limit: '200mb' }))
}

private routeMiddleware(app: Application): void {
    app.use('/api/gateway/v1', authRoutes.routes());
    app.use('/api/gateway/v1', searchRoutes.routes());
}

private startElasticSearch(app: Application): void {
    elasticSearch.checkConnection()
}

private errorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
        log.error(`${fullUrl} endpoint does not exist`)
        res.status(StatusCodes.NOT_FOUND).json('Endpoint does not exist')
        next()
    })

    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
        log.log('error',`Gateway Service ${error.comingFrom}:`, error)
        if(error instanceof CustomError) {
            res.status(error.statusCode).json('Endpoint does not exist')
        }
        next()
    })
}

private async startServer(app: Application): Promise<void> {
    try {
        const httpServer: http.Server  = new http.Server(app)
        this.startHttpServer(httpServer)
    } catch (error) {
    log.log('error', 'Gateway Service startServer() method:', error)
    }
}

private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
        httpServer.listen(SERVER_PORT, () => {
            log.log('info', `Server is running on port ${SERVER_PORT}`)
        })   
    } catch (error) {
        log.log('error', 'Gateway Service startServer() method:', error)
    }
}

}