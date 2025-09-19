import { useEffect, useState } from 'react'
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
  const [folderDataCache, setFolderDataCache] = useState<
    Map<string | null, File[]>
  >(new Map())

  const { updatePathMapping, getFolderIdFromPath } = usePathMapping()
  const currentFolderId = getFolderIdFromPath(currentFolderPath)

  // fetch root folder data
  const { items: rootItems, isLoading: isLoadingRoot } = useFolderListing(
    connectionId,
    null,
    searchParams,
  )

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
    currentFolderId,
    rootItems,
    isLoadingRoot,
  }
}
