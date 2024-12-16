import { winstonLogger } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'
import { config } from '@review/config'
import { Pool } from 'pg'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewDatabaseServer', 'debug')

const pool: Pool = new Pool({
  host: `${config.DATABASE_HOST}`,
  user: `${config.DATABASE_USER}`,
  password: `${config.DATABASE_PASSWORD}`,
  port: 5432,
  database: `${config.DATABASE_NAME}`,
  ...(config.NODE_ENV !== 'development' && config.CLUSTER_TYPE === 'AWS' && {
    ssl: {
      rejectUnauthorized: false
    }
  })
})

pool.on('error', (error: Error) => {
  log.log('error', 'pg client error', error)
  process.exit(-1)
})

const databaseConnection = async (): Promise<void> => {
  try {
    await pool.connect()
    log.info('Review service successfully connected to postgresql database.')
  } catch (error) {
    log.error('ReviewService - Unable to connect to database')
    log.log('error', 'ReviewService () method error:', error)
  }
}

export { databaseConnection, pool }