import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

/**
 * custom hook for managing file navigation state
 * inspired by tree-view component's useTree pattern for clean state management
 */
export function useFileNavigation({
  initialPath = [],
  pathToIdMap,
  onNavigate,
}: {
  initialPath?: string[]
  pathToIdMap: Map<string, string>
  onNavigate?: (path: string, folderId: string | null) => void
}) {
  const router = useRouter()
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('/')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [isNavigatingToFolder, setIsNavigatingToFolder] = useState(false)

  /**
   * update URL with current folder path using clean path-based routing
   */
  const updateURL = useCallback(
    (folderPath: string) => {
      const searchParams = new URLSearchParams(window.location.search)
      const searchQuery = searchParams.toString()
      const queryString = searchQuery ? `?${searchQuery}` : ''

      // remove leading/trailing slashes and encode each segment separately
      const cleanPath =
        folderPath === '/' ? '' : folderPath.replace(/^\/+|\/+$/g, '')
      const pathSegments = cleanPath
        .split('/')
        .filter((segment) => segment.length > 0)
      const encodedPath =
        pathSegments.length > 0
          ? `/${pathSegments.map((segment) => encodeURIComponent(segment)).join('/')}`
          : ''

      router.push(`${encodedPath}${queryString}`, { scroll: false })
    },
    [router],
  )

  /**
   * handle navigation to a folder (similar to tree-view's handleSelectChange)
   */
  const handleFolderNavigate = useCallback(
    (folderPath: string, folderId: string | null) => {
      // update navigation state atomically to prevent flashing
      setIsNavigatingToFolder(true)
      setCurrentFolderId(folderId)
      setCurrentFolderPath(folderPath)

      // notify parent component
      onNavigate?.(folderPath, folderId)

      // update URL
      updateURL(folderPath)
    },
    [onNavigate, updateURL],
  )

  /**
   * clear navigation state
   */
  const clearNavigationState = useCallback(() => {
    setIsNavigatingToFolder(false)
  }, [])

  /**
   * sync with URL path changes on initial load only (avoid navigation conflicts)
   */
  useEffect(() => {
    // Only sync on initial load when we have initial path but current path is still root
    if (
      initialPath.length > 0 &&
      currentFolderPath === '/' &&
      pathToIdMap.size > 0
    ) {
      const decodedPathSegments = initialPath.map((segment) =>
        decodeURIComponent(segment),
      )
      const targetFolderPath = `/${decodedPathSegments.join('/')}`
      const folderId = pathToIdMap.get(targetFolderPath) || null

      if (folderId) {
        setCurrentFolderPath(targetFolderPath)
        setCurrentFolderId(folderId)
        setIsNavigatingToFolder(true)
        onNavigate?.(targetFolderPath, folderId)
      }
    }
  }, [initialPath, currentFolderPath, pathToIdMap, onNavigate])

  return {
    currentFolderPath,
    currentFolderId,
    isNavigatingToFolder,
    handleFolderNavigate,
    clearNavigationState,
    updateURL,
  }
}
