import { Client } from '@elastic/elasticsearch'
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types'
import { config } from '@notification/config'
import { winstonLogger } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationElasticSearchServer', 'debug')

const elasticsearchClient = new Client({
    node: `${config.ELASTIC_SEARCH_URL}`
})

export async function checkConnection(): Promise<void> {
    let isConnected = false
    while (!isConnected) {
      try {
        const health: ClusterHealthResponse = await elasticsearchClient.cluster.health({})
        log.info(`NotificationService Elasticsearch health status - ${health.status}`)
        isConnected = true
      } catch (error) {
        log.error('Connection to Elasticsearch failed')
        log.log('error', 'NotificationService checkConnection() method:', error)
      }
    }
  }