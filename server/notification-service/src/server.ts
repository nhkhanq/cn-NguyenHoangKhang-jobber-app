import http from 'http'
import 'express-async-errors'
import { Logger } from 'winston'
import { Application } from 'express'
import { config } from '@notification/config'
import { healthRoutes } from '@notification/routes'
import { winstonLogger } from '@tanlan/jobber-shared'
import { checkConnection } from '@notification/elasticsearch'
import { createConnection } from '@notification/queues/connection'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug')

const SERVER_PORT = process.env.SERVER_PORT || 4001

export function start(app: Application): void {
    startServer(app)
    
    app.use('', healthRoutes())
    startQueues()
    startElasticSearch()
}

async function startQueues(): Promise<void> {
    await createConnection()
}

function startElasticSearch(): void {
    checkConnection()
}

function startServer(app: Application): void {
    try {
      const httpServer: http.Server = new http.Server(app);
      log.info(`Worker with process id of ${process.pid} on notification server`)
      httpServer.listen(SERVER_PORT, () => {
        log.info(`Notification server running on port ${SERVER_PORT}`)
      });
    } catch (error) {
      log.log('error', 'NotificationService startServer() method:', error)
    }
  }
