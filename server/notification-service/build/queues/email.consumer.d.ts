import { Channel } from 'amqplib';
declare function consumeAuthEmailMessages(channel: Channel): Promise<void>;
declare function consumeOrderEmailMessages(channel: Channel): Promise<void>;
export { consumeAuthEmailMessages, consumeOrderEmailMessages };
