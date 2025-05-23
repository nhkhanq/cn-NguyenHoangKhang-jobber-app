import client, { Channel, Connection } from 'amqplib'
import { config } from "@notification/config"
import { Logger } from 'winston'
import { winstonLogger } from 'jobber-shared-for-hkhanq'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationQueueConnection', 'debug')

async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`)
    const channel: Channel = await connection.createChannel()
    log.info('Notification server connected to queue success')
    closeConnection(channel, connection)
    return channel
  } catch (error) {
    log.log('error', 'NotificationService error createConnection() method:', error)
    return undefined
  }
}

function closeConnection(channel: Channel, connection: Connection): void {
  process.once('SIGINT', async () => {
    await channel.close()
    await connection.close()
  })
}

export { createConnection } 