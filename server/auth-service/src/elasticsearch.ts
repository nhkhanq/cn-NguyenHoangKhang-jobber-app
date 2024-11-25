import { Client } from '@elastic/elasticsearch'
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types'
import { config } from '@auth/config'
import { winstonLogger } from 'jobber-shared-for-hkhanq'
import { Logger } from 'winston'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authElasticSearchServer', 'debug')

const elasticsearchClient = new Client({
    node: `${config.ELASTIC_SEARCH_URL}`
})

async function checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        const health: ClusterHealthResponse = await elasticsearchClient.cluster.health({})
        log.info(`AuthService Elasticsearch health status - ${health.status}`)
        isConnected = true
      } catch (error) {
        log.error('Connection to Elasticsearch failed')
        log.log('error', 'AuthService checkConnection() method:', error)
      }
    }
  }

// async function checkIfIndexExits(indexName: string): Promise<boolean> {
//   const result: boolean = await elasticsearchClient.indices.exists({ index: indexName })
//   return result
// }

export async function createIndex(indexName: string):Promise<void> {
  try {
    const result: boolean = await elasticsearchClient.indices.exists({ index: indexName })
    if(result) {
      log.info(`Index ${indexName} already exits`)
    } else {
      await elasticsearchClient.indices.create({ index: indexName })
      await elasticsearchClient.indices.refresh({ index: indexName })
      log.info(`Create index ${indexName}`)
    }
  } catch (error) {
    log.error(`error while create the index ${indexName}`)
    log.log('error', 'AuthService createIndex() method:', error)
  }
}

  export {elasticsearchClient, checkConnection}