import { useEffect, useMemo } from 'react'
import { useSWRConfig } from 'swr'
import { useFolderListing } from '@/hooks/useFolderListing'
import { usePathMapping } from '@/hooks/usePathMapping'
import type { File, SearchSortParams } from '@/lib/types'

export interface UseFolderTreeDataOptions {
  connectionId: string | null
  currentFolderPath: string
  searchParams?: SearchSortParams
}

export interface FolderTreeData {
  folderDataCache: Map<string | null, File[]>
  currentFolderId: string | null
  rootItems: File[]
  isLoadingRoot: boolean
}

/**
 * hook for managing folder tree data state
 * @param options - configuration options
 * @returns folder tree data and utilities
 */
export function useFolderTreeData({
  connectionId,
  currentFolderPath,
  searchParams = {},
}: UseFolderTreeDataOptions): FolderTreeData {
  const { cache } = useSWRConfig()
  const { updatePathMapping, getFolderIdFromPath } = usePathMapping()
  const currentFolderId = getFolderIdFromPath(currentFolderPath)

  // fetch root folder data
  const { items: rootItems, isLoading: isLoadingRoot } = useFolderListing(
    connectionId,
    null,
    searchParams,
  )

  // cache root items and update path mapping
  const folderDataCache = useMemo(() => {
    if (!connectionId) return new Map<string | null, File[]>()

    const cacheMap = new Map<string | null, File[]>()
    const cacheKeys = Array.from(cache.keys() || [])

    for (const key of cacheKeys) {
      if (
        typeof key === 'string' &&
        key.includes(connectionId) &&
        key.startsWith('drive|')
      ) {
        const data = cache.get(key)
        if (data?.data?.data && Array.isArray(data.data.data)) {
          const keyParts = key.split('|')
          if (keyParts.length >= 3) {
            const resourceIdPart = keyParts[2]
            const folderId = resourceIdPart === 'root' ? null : resourceIdPart

            cacheMap.set(folderId, data.data.data)
          }
        }
      }
    }
    return cacheMap
  }, [cache, connectionId])

  // update path mapping for all cached items
  useEffect(() => {
    if (rootItems.length > 0) {
      updatePathMapping(rootItems)
    }

    const cacheKeys = Array.from(cache.keys() || [])
    for (const key of cacheKeys) {
      if (
        typeof key === 'string' &&
        key.includes(connectionId || '') &&
        key.startsWith('drive|')
      ) {
        const data = cache.get(key)
        if (data?.data?.data && Array.isArray(data.data.data)) {
          const keyParts = key.split('|')
          if (keyParts.length >= 3 && keyParts[2] !== 'root') {
            updatePathMapping(data.data.data)
          }
        }
      }
    }
  }, [rootItems, updatePathMapping, cache, connectionId])

  // ensure parent folders are loaded
  const pathSegments = currentFolderPath.split('/').filter(Boolean)
  const parentPath =
    pathSegments.length > 1 ? `/${pathSegments.slice(0, -1).join('/')}` : null
  const parentFolderId = parentPath ? getFolderIdFromPath(parentPath) : null

  // ensure parent folder is loaded
  useFolderListing(
    parentFolderId ? connectionId : null,
    parentFolderId,
    searchParams,
  )

  return {
    folderDataCache,
    currentFolderId,
    rootItems,
    isLoadingRoot,
  }
}
