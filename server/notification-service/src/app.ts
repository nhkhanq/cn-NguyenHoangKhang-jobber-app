import { log, Logger } from 'winston'
import { pinoLogger } from  '@rohanpradev/jobber-shared'
import { config } from './config';
import express ,{Express} from 'express'
import { start } from '@notification/server'

const logger = pinoLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug')

function initialize(): void {
    const app: Express = express()
    start(app)
    logger.info(`Notification service is running`)
}

initialize()