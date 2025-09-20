import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { useNavigationStore } from '@/store/navigationStore'

/**
 * custom hook for managing file navigation state
 * inspired by tree-view component's useTree pattern for clean state management
 */
export function useFileNavigation({
  initialPath = [],
  onNavigate,
}: {
  initialPath?: string[]
  onNavigate?: (path: string, folderId: string | null) => void
}) {
  const router = useRouter()
  const {
    currentFolderPath,
    currentFolderId,
    isNavigatingToFolder,
    pathToIdMap,
    setCurrentFolder,
    setNavigating,
    addPathMapping,
  } = useNavigationStore()

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

      const finalPath = encodedPath || '/'
      router.push(`${finalPath}${queryString}`, { scroll: false })
    },
    [router],
  )

  /**
   * handle navigation to a folder (similar to tree-view's handleSelectChange)
   */
  const handleFolderNavigate = useCallback(
    (folderPath: string, folderId: string | null) => {
      // prevent duplicate navigation to the same folder
      if (currentFolderPath === folderPath && currentFolderId === folderId) {
        return
      }

      // prevent URL sync from interfering
      isManualNavigationRef.current = true
      if (folderId) {
        addPathMapping(folderPath, folderId)
      }

      // update navigation state
      setCurrentFolder(folderPath, folderId)

      // notify parent component
      onNavigate?.(folderPath, folderId)

      // update URL
      updateURL(folderPath)
    },
    [
      onNavigate,
      updateURL,
      currentFolderPath,
      currentFolderId,
      addPathMapping,
      setCurrentFolder,
    ],
  )

  /**
   * clear navigation state
   */
  const clearNavigationState = useCallback(() => {
    setNavigating(false)
  }, [setNavigating])

  /**
   * sync with URL path changes on initial load only (avoid navigation conflicts)
   */
  const hasInitialSyncRef = useRef(false)
  const isManualNavigationRef = useRef(false)

  useEffect(() => {
    // Only navigate on initial page load when URL has a path but we're at root
    // Skip if we're in the middle of manual navigation
    const targetPath =
      initialPath.length > 0 ? `/${initialPath.join('/')}` : '/'
    const shouldSync =
      initialPath.length > 0 &&
      currentFolderPath === '/' &&
      pathToIdMap.size > 0 &&
      !hasInitialSyncRef.current &&
      !isManualNavigationRef.current &&
      targetPath !== currentFolderPath

    if (shouldSync) {
      const decodedPathSegments = initialPath.map((segment) =>
        decodeURIComponent(segment),
      )

      // deepest available folder in the path
      const targetFolderPath = `/${decodedPathSegments.join('/')}`
      const folderId = pathToIdMap.get(targetFolderPath) || null

      if (folderId) {
        hasInitialSyncRef.current = true
        setCurrentFolder(targetFolderPath, folderId)
        onNavigate?.(targetFolderPath, folderId)
        updateURL(targetFolderPath)
      }
    }
  }, [
    initialPath,
    currentFolderPath,
    pathToIdMap,
    onNavigate,
    updateURL,
    setCurrentFolder,
  ])

  return {
    currentFolderPath,
    currentFolderId,
    isNavigatingToFolder,
    handleFolderNavigate,
    clearNavigationState,
    updateURL,
  }
}
