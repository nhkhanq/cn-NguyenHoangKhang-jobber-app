import client, { Channel, Connection } from 'amqplib';
import { config } from "@notification/config";
import { pinoLogger } from '@rohanpradev/jobber-shared';

const logger = pinoLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

async function createConnection(): Promise<Channel | undefined> {
    try {
        const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
        const channel: Channel = await connection.createChannel();

        closeConnection(channel, connection);
        return channel
        //logger.info("Connection and channel created successfully");

        return channel;
    } catch (error) {
        //log.log
        return undefined
    }
}

// Định nghĩa lại hàm closeConnection
async function closeConnection(channel: Channel, connection: Connection): Promise<void> {
    process.once('SIGINT', async () => {
        await channel.close();
        await connection.close();
        logger.info("Connection and channel closed successfully");
    });
}

export { createConnection };
