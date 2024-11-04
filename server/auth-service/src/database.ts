import { Logger } from 'winston'
import { winstonLogger } from '@tanlan/jobber-shared'
import { config } from "@auth/config"
import { Sequelize } from 'sequelize'


const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authDatabase', 'debug')


export const sequelize = new Sequelize(process.env.MYSQL_DB || '' ,{
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        multipleStatements: true
    }
})

export async function databaseConnection(): Promise<void> {
    try {
        await sequelize.authenticate()
        log.info('AuthService MySQL connect to db success')
    } catch (error) {
        log.error('Auth service unable connect to db')
        log.log('error', 'AuthService databaseConnection() method error', error)
    }
}
