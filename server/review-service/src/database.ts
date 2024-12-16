import { winstonLogger } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'
import { config } from '@review/config'


const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chatDatabaseServer', 'debug')

const databaseConnection = async (): Promise<void> => {

}

export { databaseConnection }