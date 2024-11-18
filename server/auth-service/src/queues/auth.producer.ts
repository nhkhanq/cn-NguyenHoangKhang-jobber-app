import { config } from '@auth/config'
import { Logger } from 'winston'
import { firstLetterUppercase, IAuthDocument, winstonLogger } from '@tanlan/jobber-shared'
import { Channel } from 'amqplib'
import { createConnection } from '@auth/queues/connection'
import { Model } from 'sequelize'
import { AuthModel } from '@auth/models/auth.schema'
import { lowerCase } from 'lodash'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceProducer', 'debug')

export async function publishDirecMessage(
    channel: Channel,
    exchangeName: string,
    routingKey: string,
    message: string,
    logMessage: string
): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection() as Channel
        } 
        await channel.assertExchange(exchangeName, 'direct')
        channel.publish(exchangeName, routingKey, Buffer.from(message))       
    } catch (error) {
        log.log('error', 'AuthService publishDirecMessage() method error', error)
    }
}

export async function getUserByUsername(username: string) : Promise<IAuthDocument | null> {
    const user: Model<IAuthDocument> = await AuthModel.findOne({
        where:  { username: firstLetterUppercase(username)}      
    }) as Model
    return user.dataValues
}

