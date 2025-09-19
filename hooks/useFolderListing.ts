import { useEffect, useRef } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { getDefaultAuthHeaders, listResources } from '@/lib/api'
import type { SearchSortParams } from '@/lib/types'
import { generateFolderCacheKey } from '@/utils/cache-keys'

/**
 * fetch folder listing with persistent caching and navigation-aware strategy
 * @param connectionId
 * @param resourceId
 * @param params
 * @returns
 */
export function useFolderListing(
  connectionId: string | null,
  resourceId: string | null,
  params: SearchSortParams = {},
) {
  const { cache } = useSWRConfig()
  const lastFetchedRef = useRef<string | null>(null)

  // create consistent key for swr caching
  const key = connectionId
    ? generateFolderCacheKey(connectionId, resourceId, params)
    : null

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    key,
    async () => {
      if (!connectionId) return null

      const headers = await getDefaultAuthHeaders()
      const result = await listResources(
        connectionId,
        resourceId,
        params,
        headers,
      )
      lastFetchedRef.current = key
      return result
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
      dedupingInterval: 7200000,
      keepPreviousData: true,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
      refreshInterval: 0,
      fallbackData: undefined,
    },
  )

  // only fetch if we have no cached data + no current data
  useEffect(() => {
    if (!key || isLoading) return

    const cachedData = cache.get(key)
    const hasCachedData =
      cachedData?.data &&
      Array.isArray(cachedData.data) &&
      cachedData.data.length > 0
    const hasCurrentData =
      data?.data && Array.isArray(data.data) && data.data.length > 0
    const shouldFetch = !hasCachedData && !hasCurrentData && !isValidating

    if (shouldFetch) {
      mutate()
    }
  }, [key, isLoading, isValidating, cache, data, mutate])

  return {
    items: data?.data || [],
    nextPageToken: data?.nextPageToken,
    isLoading,
    isError: !!error,
    error,
    mutate,
    isValidating,
  }
}

/**
 * prefetch folder contents with consistent caching strategy
 * @param connectionId
 * @param resourceId
 * @param params
 */
export function usePrefetchFolder() {
  const { mutate } = useSWRConfig()

  const prefetch = async (
    connectionId: string,
    resourceId: string,
    params: SearchSortParams = {},
  ) => {
    const key = generateFolderCacheKey(connectionId, resourceId, params)
    const headers = await getDefaultAuthHeaders()

    // prefetch without triggering revalidation, store in cache for future use
    mutate(key, listResources(connectionId, resourceId, params, headers), {
      revalidate: false,
    })
  }

  return { prefetch }
}
