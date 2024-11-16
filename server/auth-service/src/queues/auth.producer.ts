import { config } from '@auth/config'
import { Logger } from 'winston'
import { winstonLogger } from '@tanlan/jobber-shared'
import { Channel } from 'amqplib'
import { createConnection } from '@auth/queues/connection'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceProducer', 'debug')

export async function publishDirecMessage(
    channel: Channel,
    exchangeName: string,
    message: string,
    logMessage: string
): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection() as Channel
        }        
    } catch (error) {
        log.log('error', 'AuthService publishDirecMessage() method error', error)
    }
}
