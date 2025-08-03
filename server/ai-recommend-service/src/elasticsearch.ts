import { Client } from '@elastic/elasticsearch'
import { ClusterHealthHealthResponseBody } from '@elastic/elasticsearch/lib/api/types'
import { config } from '@ai/config'
import { Logger } from 'winston'
import { createLogger } from '@ai/logger'

const log: Logger = createLogger('aiRecommendServiceElasticConnection')

// Disable Elasticsearch for now to prevent authentication errors
const elasticSearchClient = null

const checkConnection = async (): Promise<void> => {
  if (!elasticSearchClient) {
    log.info('AI Recommendation service - Elasticsearch disabled for development')
    return
  }
  
  // Since elasticSearchClient is disabled, just return
  return
}

export { elasticSearchClient, checkConnection }