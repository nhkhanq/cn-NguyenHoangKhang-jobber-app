import { winstonLogger } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'
import { config } from '@gig/config'
import mongoose from 'mongoose'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigDatabaseServer', 'debug')

const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(`${config.DATABASE_URL}`)
    log.info('Users service successfully connected to database')
  } catch (error) {
    log.log('error', 'GigService databaseConnection() method error:', error)
  }
}

export { databaseConnection }