import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
import { config } from '@notification/config';
import { winstonLogger } from '@tanlan/jobber-shared';
import { createConnection } from '@notification/queues/connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');

async function consumeAuthEmailMessage(channel: Channel): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection() as Channel;
        }
        
        const exchangeName = 'jobber-email-notification';
        const routingKey = 'email-auth';
        const queueName = 'email-auth-queue';
        
        // Assert the exchange
        await channel.assertExchange(exchangeName, 'direct', { durable: true });
        
        // Assert the queue
        const notiQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
        
        // Bind the queue to the exchange with the routing key
        await channel.bindQueue(notiQueue.queue, exchangeName, routingKey);
        
        // Start consuming messages
        channel.consume(notiQueue.queue, async (msg: ConsumeMessage | null) => {
            if (msg) {
                console.log(JSON.parse(msg.content.toString())); // Process send email
                channel.ack(msg);  // Acknowledge the message 
            }
        });

    } catch (error) {
        log.log('error', 'NotificationService consumeAuthEmailMessage() method:', error);
    }
}

async function consumeOrderEmailMessage(channel: Channel): Promise<void> {
    try {
        if (!channel) {
            channel = await createConnection() as Channel;
        }
        
        const exchangeName = 'jobber-order-notification';
        const routingKey = 'order-auth';
        const queueName = 'order-auth-queue';
        
        // Assert the exchange
        await channel.assertExchange(exchangeName, 'direct', { durable: true });
        
        // Assert the queue
        const notiQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
        
        // Bind the queue to the exchange with the routing key
        await channel.bindQueue(notiQueue.queue, exchangeName, routingKey);
        
        // Start consuming messages
        channel.consume(notiQueue.queue, async (msg: ConsumeMessage | null) => {
            if (msg) {
                console.log(JSON.parse(msg.content.toString())); // Process send email
                channel.ack(msg);  // Acknowledge the message 
            }
        });

    } catch (error) {
        log.log('error', 'NotificationService consumeOrderEmailMessage() method:', error)
    }
}

export { consumeAuthEmailMessage, consumeOrderEmailMessage }
