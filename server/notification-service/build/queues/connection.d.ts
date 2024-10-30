import { Channel } from 'amqplib';
declare function createConnection(): Promise<Channel | undefined>;
export { createConnection };
