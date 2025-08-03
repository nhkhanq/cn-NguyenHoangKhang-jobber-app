import http from 'http'
import 'express-async-errors'
import { CustomError, IAuthPayload, IErrorResponse } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'
import { config } from '@ai/config'
import { Application, Request, Response, NextFunction, json, urlencoded } from 'express'
import hpp from 'hpp'
import helmet from 'helmet'
import cors from 'cors'
import { verify } from 'jsonwebtoken'
import compression from 'compression'
import { checkConnection } from '@ai/elasticsearch'
import { appRoutes } from '@ai/route'
import { createLogger } from '@ai/logger'

const SERVER_PORT = parseInt(config.PORT!, 10) || 4009
const log: Logger = createLogger('aiRecommendServer')

const start = (app: Application): void => {
  securityMiddleware(app)
  standardMiddleware(app)
  routesMiddleware(app)
  startElasticSearch()
  aiErrorHandler(app)
  startServer(app)
}

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1)
  app.use(hpp())
  app.use(helmet())
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  )
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const payload: IAuthPayload = verify(token, config.JWT_TOKEN!) as IAuthPayload
      req.currentUser = payload
    }
    next()
  })
}

const standardMiddleware = (app: Application): void => {
  app.use(compression())
  app.use(json({ limit: '100mb' }))
  app.use(urlencoded({ extended: true, limit: '100mb' }))
}

const routesMiddleware = (app: Application): void => {
  appRoutes(app)
}

const startElasticSearch = (): void => {
  checkConnection()
}

const aiErrorHandler = (app: Application): void => {
  app.use('*', (req: Request, res: Response, next: NextFunction) => {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    log.log('error', `${fullUrl} endpoint does not exist.`, '')
    res.status(404).json({ message: 'The endpoint called does not exist.' })
    next()
  })

  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `AI Recommendation service ${error.comingFrom}:`, error)
    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors())
    } else {
      res.status(500).json({
        message: 'An unexpected error occurred',
        error: config.NODE_ENV === 'development' ? error : {}
      })
    }
    next()
  })
}

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app)
    log.info(`AI Recommendation server has started with process id ${process.pid}`)
    httpServer.listen(SERVER_PORT, () => {
      log.info(`AI Recommendation server running on port ${SERVER_PORT}`)
    })
  } catch (error) {
    log.log('error', 'AI Recommendation service startServer() error method:', error)
  }
}

export { start }