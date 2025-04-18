import { config } from "@auth/config";
import { Logger } from "winston";
import {
  firstLetterUppercase,
  IAuthDocument,
  winstonLogger,
} from "jobber-shared-for-hkhanq";
import { Channel } from "amqplib";
import { createConnection } from "@auth/queues/connection";

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  "authServiceProducer",
  "debug"
);

export async function publishDirecMessage(
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    await channel.assertExchange(exchangeName, "direct");
    channel.publish(exchangeName, routingKey, Buffer.from(message));
  } catch (error) {
    log.log("error", "AuthService publishDirecMessage() method error", error);
  }
}
