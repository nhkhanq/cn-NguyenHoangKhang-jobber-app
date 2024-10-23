import { Client } from '@elastic/elasticsearch'
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types'
import { config } from '@notification/config'
import { pinoLogger } from '@rohanpradev/jobber-shared'
import { log } from 'winston'


const logger = pinoLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug')

const elasticsearchClient = new Client({
    node: `${config.ELASTIC_SEARCH_URL}`
})

export async function checkConnection(): Promise<void> {
    let isConnected = false
    while(!isConnected) {
        try {
            const health: ClusterHealthResponse = await elasticsearchClient.cluster.health({})
            logger.info(`Notification service Elasticsearch is OK, status ${health.status}`)
            isConnected = true
        } catch (error) {
            logger.error('Connect to Elasticsearch failed')
            logger.error('error' ,'Notification service checkConnection() method', error)
        }
    }

}