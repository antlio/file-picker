import { useCallback, useState } from 'react'
import type { File } from '@/lib/types'

/**
 * hook for managing path-to-id mapping for folder navigation
 * @returns path mapping state and update function
 */
export function usePathMapping() {
  const [pathToIdMap, setPathToIdMap] = useState<Map<string, string>>(new Map())

  /**
   * update path-to-id mapping for folders
   * @param items
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

  /**
   * get folder id from path
   * @param path
   * @returns
   */
  const getFolderIdFromPath = useCallback(
    (path: string) => {
      return path === '/' ? null : pathToIdMap.get(path) || null
    },
    [pathToIdMap],
  )

  /**
   * clear all path mappings
   */
  const clearPathMapping = useCallback(() => {
    setPathToIdMap(new Map())
  }, [])

  return {
    pathToIdMap,
    updatePathMapping,
    getFolderIdFromPath,
    clearPathMapping,
  }
}
