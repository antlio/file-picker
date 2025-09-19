import { useCallback, useEffect, useState } from 'react'
import { useFolderListing } from '@/hooks/useFolderListing'
import type { File, SearchSortParams } from '@/lib/types'

export interface UseFolderTreeDataOptions {
  connectionId: string | null
  currentFolderPath: string
  searchParams?: SearchSortParams
}

export interface FolderTreeData {
  folderDataCache: Map<string | null, File[]>
  pathToIdMap: Map<string, string>
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
  const [folderDataCache, setFolderDataCache] = useState<
    Map<string | null, File[]>
  >(new Map())
  const [pathToIdMap, setPathToIdMap] = useState<Map<string, string>>(new Map())

  const currentFolderId =
    currentFolderPath === '/'
      ? null
      : pathToIdMap.get(currentFolderPath) || null

  // fetch root folder data
  const { items: rootItems, isLoading: isLoadingRoot } = useFolderListing(
    connectionId,
    null,
    searchParams,
  )

  /**
   * update path-to-id mapping for folders
   * @param items - folder items to map
   */
  const updatePathMapping = useCallback((items: File[]) => {
    setPathToIdMap((prev) => {
      const newMap = new Map(prev)
      items.forEach((item) => {
        if (item.inode_type === 'directory' && item.inode_path?.path) {
          newMap.set(`/${item.inode_path.path}`, item.resource_id)
        }
      })
      return newMap
    })
  }, [])

  // cache root items and update path mapping
  useEffect(() => {
    if (rootItems.length > 0) {
      setFolderDataCache((prev) => new Map(prev).set(null, rootItems))
      updatePathMapping(rootItems)
    }
  }, [rootItems, updatePathMapping])

  // fetch current folder's children when needed
  useEffect(() => {
    if (
      !connectionId ||
      !currentFolderId ||
      folderDataCache.has(currentFolderId)
    ) {
      return
    }

    const fetchCurrentFolderContents = async () => {
      try {
        const { listResources, getDefaultAuthHeaders } = await import(
          '@/lib/api'
        )
        const headers = await getDefaultAuthHeaders()
        const result = await listResources(
          connectionId,
          currentFolderId,
          searchParams,
          headers,
        )

        const items = result.data || []
        setFolderDataCache((prev) => new Map(prev).set(currentFolderId, items))
        updatePathMapping(items)
      } catch (error) {
        console.error('Failed to fetch current folder contents:', {
          currentFolderId,
          connectionId,
          searchParams,
          error: error instanceof Error ? error.message : error,
        })
      }
    }

    fetchCurrentFolderContents()
  }, [
    connectionId,
    currentFolderId,
    searchParams,
    folderDataCache,
    updatePathMapping,
  ])

  return {
    folderDataCache,
    pathToIdMap,
    currentFolderId,
    rootItems,
    isLoadingRoot,
  }
}
