import { Client } from '@elastic/elasticsearch'
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types'
import { config } from '@gig/config'
import { winstonLogger } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigsElasticSearchServer', 'debug')

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
})

const checkConnection = async (): Promise<void> => {
  let isConnected = false
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({})
      log.info(`GigService Elasticsearch health status - ${health.status}`)
      isConnected = true
    } catch (error) {
      log.error('Connection to Elasticsearch failed')
      log.log('error', 'GigService checkConnection() method:', error)
    }
  }
}

export { checkConnection }