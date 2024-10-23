import 'express-async-errors'
import http from 'http'
import { pinoLogger } from '@rohanpradev/jobber-shared'
import { config } from '@notification/config'
import { Application } from 'express'
import { healthRoutes } from '@notification/routes'
import { checkConnection } from '@notification/elasticsearch'

const logger = pinoLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug')

const SERVER_PORT = process.env.SERVER_PORT || 4001;

export function start(app: Application): void {
    startServer(app);
    
    app.use('', healthRoutes())
    startQueues();
    startElasticSearch();
}

async function startQueues(): Promise<void> {
    //
}

function startElasticSearch(): void {
    checkConnection()
}

function startServer(app: Application): void {
    try {
        const httpServer = new http.Server(app)
        logger.info(`Work in process ${process.pid} on notification server`)
        httpServer.listen(SERVER_PORT, () => {
            logger.info(`Notification service running on port ${SERVER_PORT}`)
        });
    } catch (error) {
        logger.error('Notification service startServer() method:', error)
    }
}
