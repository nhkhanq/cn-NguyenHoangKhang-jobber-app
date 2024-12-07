import { SearchResponse } from '@elastic/elasticsearch/lib/api/types'
import { elasticSearchClient } from '@gig/elasticsearch'
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult } from 'jobber-shared-for-hkhanq'

const gigsSearchBySellerId = async (searchQuery: string, active: boolean): Promise<ISearchResult> => {
  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: ['sellerId'],
        query: `*${searchQuery}*`
      }
    },
    {
      term: {
        active
      }
    }
  ]
  const result: SearchResponse = await elasticSearchClient.search({
    index: 'gigs',
    query: {
      bool: {
        must: [...queryList]
      }
    }
  })
  const total: IHitsTotal = result.hits.total as IHitsTotal
  return {
    total: total.value,
    hits: result.hits.hits
  }
}

export { gigsSearchBySellerId }