import { Logger } from 'winston'
import { config } from '@ai/config'
import { createClient } from 'redis'
import { createLogger } from '@ai/logger'

type RedisClient = ReturnType<typeof createClient>
const log: Logger = createLogger('aiRecommendServiceRedis')

class RedisConnection {
  client: RedisClient

  constructor() {
    this.client = createClient({ url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}` })
  }

  async redisConnect(): Promise<void> {
    try {
      await this.client.connect()
      log.info(`AI Recommendation service Redis connection: ${await this.client.ping()}`)
      this.cacheError()
    } catch (error) {
      log.log('error', 'AI Recommendation service Redis connection error', error)
    }
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      log.error(error)
    })
  }
}

export const redisConnection: RedisConnection = new RedisConnection()
export const redisConnect = async (): Promise<void> => {
  await redisConnection.redisConnect()
}