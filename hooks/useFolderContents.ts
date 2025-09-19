import { useCallback, useEffect } from 'react'
import useSWR, { preload, useSWRConfig } from 'swr'
import { getDefaultAuthHeaders, listResources } from '@/lib/api'
import type { SearchSortParams } from '@/lib/types'

/**
 * global fetcher function for SWR
 */
const folderFetcher = async (key: string) => {
  const [, connectionId, folderId, paramsStr] = key.split('|')
  const params = JSON.parse(paramsStr || '{}')
  const headers = await getDefaultAuthHeaders()
  return listResources(
    connectionId,
    folderId === 'null' ? null : folderId,
    params,
    headers,
  )
}

/**
 * create swr key for folder
 */
const createFolderKey = (
  connectionId: string,
  folderId: string | null,
  params: SearchSortParams,
) => {
  return `drive|${connectionId}|${folderId}|${JSON.stringify(params)}`
}

/**
 * hook for managing folder contents across the entire tree
 * @param connectionId
 * @param params
 * @returns
 */
export function useFolderContents(
  connectionId: string | null,
  params: SearchSortParams = {},
) {
  const { mutate } = useSWRConfig()

  /**
   * prefetch folder contents on hover using SWR preload
   */
  const prefetchFolder = useCallback(
    async (folderId: string) => {
      if (!connectionId) return

      const key = createFolderKey(connectionId, folderId, params)
      preload(key, folderFetcher)
    },
    [connectionId, params],
  )

  /**
   * force load folder data
   */
  const loadFolderData = useCallback(
    async (folderId: string) => {
      if (!connectionId) return null

      const key = createFolderKey(connectionId, folderId, params)
      return mutate(key, folderFetcher(key))
    },
    [connectionId, params, mutate],
  )

  /**
   * create key for folder
   */
  const createKey = useCallback(
    (folderId: string | null) => {
      return connectionId
        ? createFolderKey(connectionId, folderId, params)
        : null
    },
    [connectionId, params],
  )

  return {
    prefetchFolder,
    loadFolderData,
    createKey,
  }
}

/**
 * hook to get folder data for a specific folder
 * @param connectionId
 * @param folderId
 * @param params
 * @returns
 */
export function useFolderData(
  connectionId: string | null,
  folderId: string | null,
  params: SearchSortParams = {},
) {
  const key = connectionId
    ? createFolderKey(connectionId, folderId, params)
    : null
  const { cache } = useSWRConfig()

  const swrResult = useSWR(key, folderFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: false,
    dedupingInterval: 3600000,
    keepPreviousData: true,
    revalidateIfStale: false,
    shouldRetryOnError: false,
  })

  // trigger initial fetch only if no cached data exists, but allow cached data to show immediately
  useEffect(() => {
    if (key && !swrResult.data && !swrResult.isLoading) {
      // check if we have cached data first
      const cachedData = cache.get(key)?.data
      if (cachedData) {
        // if cached data, use it
        swrResult.mutate(cachedData, false)
      } else {
        // no cached data, fetch it
        swrResult.mutate()
      }
    }
  }, [key, cache, swrResult.data, swrResult.isLoading, swrResult.mutate])

  return swrResult
}
