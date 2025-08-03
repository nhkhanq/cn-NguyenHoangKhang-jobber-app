import { Logger } from 'winston'
import { config } from '@ai/config'
import mongoose from 'mongoose'
import { createLogger } from '@ai/logger'

const log: Logger = createLogger('aiRecommendServiceDB')

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`)
    log.info('AI Recommendation service successfully connected to database.')
  } catch (error) {
    log.log('error', 'AI Recommendation service error connecting to database', error)
  }
}

export { databaseConnection }