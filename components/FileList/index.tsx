'use client'

import {
  AlertCircle,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Folder from '@/assets/Folder'
import FolderOpen from '@/assets/FolderOpen'
import { FloatingToolbar } from '@/components/FloatingToolbar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDeindexAction } from '@/hooks/useDeindexAction'
import { useFolderListing, usePrefetchFolder } from '@/hooks/useFolderListing'
import { useIndexAction } from '@/hooks/useIndexAction'
import { useSearchSort } from '@/hooks/useSearchSort'
import type { File } from '@/lib/types'
import { generateFolderCacheKey } from '@/utils/cache-keys'
import { FileRow } from './FileRow'
import { SkeletonRows } from './SkeletonRow'

/**
 * animated counter component with jackpot-style counting animation
 */
function AnimatedCounter({
  value,
  duration = 800,
}: {
  value: number
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (value === displayValue) return

    const startTime = Date.now()
    const startValue = displayValue
    const endValue = value
    const changeValue = endValue - startValue

    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Use easeOutQuart for smooth deceleration
      const easeProgress = 1 - (1 - progress) ** 4
      const currentValue = Math.round(startValue + changeValue * easeProgress)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, displayValue])

  return (
    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-[3px] font-mono tabular-nums transition-all duration-150">
      {displayValue}
    </span>
  )
}

interface FileListContainerProps {
  connectionId?: string | null
  onFileClick?: (file: File) => void
  initialPath?: string[]
}

export function FileListContainer({
  connectionId = null,
  onFileClick,
  initialPath = [],
}: FileListContainerProps) {
  const router = useRouter()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('/')
  const [currentFilter, setCurrentFilter] = useState<
    'all' | 'indexed' | 'not_indexed'
  >('all')
  const [isNavigatingToFolder, setIsNavigatingToFolder] = useState(false)
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null)
  const [pathToIdMap, setPathToIdMap] = useState<Map<string, string>>(new Map())
  const [_isBuildingPathMapping, setIsBuildingPathMapping] = useState(false)

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

  const { searchQuery, sortBy, sortOrder, updateSearch, updateSort } =
    useSearchSort()

  // current folder data
  const baseParams = useMemo(
    () => ({ sort: sortBy, order: sortOrder }),
    [sortBy, sortOrder],
  )

  // root data to build path mappings
  const { items: rootItems } = useFolderListing(connectionId, null, baseParams)

  // current folder contents
  const {
    items: currentItems,
    isLoading,
    isError,
    error,
    mutate,
  } = useFolderListing(connectionId, currentFolderId, baseParams)

  useEffect(() => {
    if (rootItems.length > 0) {
      setPathToIdMap((prev) => {
        const newMap = new Map(prev)
        rootItems.forEach((item) => {
          if (item.inode_type === 'directory' && item.inode_path?.path) {
            newMap.set(`/${item.inode_path.path}`, item.resource_id)
          }
        })
        return newMap
      })
    }
  }, [rootItems])

  useEffect(() => {
    if (currentItems.length > 0) {
      setPathToIdMap((prev) => {
        const newMap = new Map(prev)
        currentItems.forEach((item) => {
          if (item.inode_type === 'directory' && item.inode_path?.path) {
            newMap.set(`/${item.inode_path.path}`, item.resource_id)
          }
        })
        return newMap
      })
    }
  }, [currentItems])

  // clear navigation state when new folder data loads
  useEffect(() => {
    if (!isLoading && currentItems.length >= 0 && isNavigatingToFolder) {
      const timer = setTimeout(() => {
        setIsNavigatingToFolder(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading, currentItems.length, isNavigatingToFolder])

  useEffect(() => {
    async function buildNestedPathMapping() {
      if (!connectionId || !initialPath.length) return

      const decodedPathSegments = initialPath.map((segment) =>
        decodeURIComponent(segment),
      )
      const targetFolderPath = `/${decodedPathSegments.join('/')}`

      if (targetFolderPath === '/' || pathToIdMap.has(targetFolderPath)) {
        return
      }

      setIsBuildingPathMapping(true)

      try {
        const { listResources, getDefaultAuthHeaders } = await import(
          '@/lib/api'
        )
        const headers = await getDefaultAuthHeaders()

        let currentLevelId: string | null = null
        let builtPath = ''

        for (let i = 0; i < decodedPathSegments.length; i++) {
          const segment = decodedPathSegments[i]
          const nextPath = `${builtPath}/${segment}`

          if (pathToIdMap.has(nextPath)) {
            currentLevelId = pathToIdMap.get(nextPath) || null
            builtPath = nextPath
            continue
          }

          // same cache key format as useFolderListing hook
          const cacheKey = generateFolderCacheKey(
            connectionId,
            currentLevelId,
            baseParams,
          )

          // SWR cache first, otherwise fetch
          const { mutate } = await import('swr')
          let result: { data?: File[] } | null = null
          // fetch and populate SWR cache
          const freshData = await listResources(
            connectionId,
            currentLevelId,
            baseParams,
            headers,
          )

          // store in SWR cache for future use
          await mutate(cacheKey, freshData, false)
          result = freshData

          const folderItems = (result.data || []).filter(
            (item: File) => item.inode_type === 'directory',
          )

          const newMappings = new Map<string, string>()
          folderItems.forEach((folder: File) => {
            if (folder.inode_path?.path) {
              const fullPath = `/${folder.inode_path.path}`
              newMappings.set(fullPath, folder.resource_id)
            }
          })

          if (newMappings.size > 0) {
            setPathToIdMap((prev) => {
              const updatedMap = new Map(prev)
              newMappings.forEach((id, path) => {
                updatedMap.set(path, id)
              })
              return updatedMap
            })
          }

          const targetFolder = folderItems.find((folder: File) => {
            if (!folder.inode_path?.path) return false

            const fullTargetPath = decodedPathSegments.slice(0, i + 1).join('/')
            return folder.inode_path.path === fullTargetPath
          })

          if (targetFolder) {
            currentLevelId = targetFolder.resource_id
            builtPath = `/${targetFolder.inode_path.path}`

            // Check if this is our final target path
            if (builtPath !== targetFolderPath) {
              break
            }
          }
        }
      } catch (_) {
      } finally {
        setIsBuildingPathMapping(false)
      }
    }

    buildNestedPathMapping()
  }, [connectionId, initialPath, baseParams, pathToIdMap])

  // init from URL path (path-based navigation)
  useEffect(() => {
    const decodedPathSegments = initialPath.map((segment) =>
      decodeURIComponent(segment),
    )
    const targetFolderPath =
      decodedPathSegments.length > 0 ? `/${decodedPathSegments.join('/')}` : '/'

    if (targetFolderPath !== '/' && pathToIdMap.size === 0) {
      return
    }

    if (targetFolderPath !== currentFolderPath) {
      setIsNavigatingToFolder(true)
      setCurrentFolderPath(targetFolderPath)

      // look up the folder ID from the path
      let folderId: string | null = null

      if (targetFolderPath === '/') {
        folderId = null
      } else {
        folderId = pathToIdMap.get(targetFolderPath) || null
      }

      if (currentFolderId !== folderId) {
        setCurrentFolderId(folderId)
      }
    } else {
      if (targetFolderPath !== '/') {
        const folderId = pathToIdMap.get(targetFolderPath) || null
        if (folderId && folderId !== currentFolderId) {
          setCurrentFolderId(folderId)
        }
      }
    }
  }, [initialPath, currentFolderPath, pathToIdMap, currentFolderId])

  const { indexResource, indexBulk } = useIndexAction(connectionId || '')
  const { deindexResource, deindexBulk } = useDeindexAction(connectionId || '')
  const { prefetch } = usePrefetchFolder()

  /**
   * simple fuzzy search function
   */
  const fuzzySearch = useCallback((items: File[], query: string): File[] => {
    if (!query.trim()) return items

    const searchTerm = query.toLowerCase()
    return items.filter((item) => {
      // use path as name
      const name = (item.inode_path?.path || '').toLowerCase()

      // skip items with no name
      if (!name) return false

      // simple fuzzy matching loop
      let searchIndex = 0
      for (let i = 0; i < name.length && searchIndex < searchTerm.length; i++) {
        if (name[i] === searchTerm[searchIndex]) {
          searchIndex++
        }
      }

      // check exact substring matches in name
      const exactMatch = name.includes(searchTerm)
      const fuzzyMatch = searchIndex === searchTerm.length

      return exactMatch || fuzzyMatch
    })
  }, [])

  /**
   * pre-compute all filter results with search applied (optimistic UI)
   */
  const precomputedFilters = useMemo(() => {
    const searchedItems = fuzzySearch(currentItems, searchQuery)

    const all = searchedItems
    const indexed = searchedItems.filter(
      (item) => item.indexedStatus === 'indexed',
    )
    const not_indexed = searchedItems.filter(
      (item) =>
        item.indexedStatus === 'not_indexed' ||
        item.indexedStatus === 'deindexing',
    )
    const indexing = searchedItems.filter(
      (item) => item.indexedStatus === 'indexing',
    )

    return { all, indexed, not_indexed, indexing }
  }, [currentItems, searchQuery, fuzzySearch])

  /**
   * get current filtered items (instant lookup, no filtering delay)
   */
  const filteredItems = useMemo(() => {
    return (
      precomputedFilters[currentFilter as keyof typeof precomputedFilters] ||
      precomputedFilters.all
    )
  }, [precomputedFilters, currentFilter])

  /**
   * separate filtered items into folders and files
   */
  const filteredFolders = useMemo(() => {
    return filteredItems.filter((item) => item.inode_type === 'directory')
  }, [filteredItems])

  const filteredFiles = useMemo(() => {
    return filteredItems.filter((item) => item.inode_type !== 'directory')
  }, [filteredItems])

  /**
   * handle folder navigation (optimistic - navigate immediately, show skeleton while loading)
   */
  const handleFolderNavigate = useCallback(
    (folder: File) => {
      const folderPath = folder.inode_path?.path
        ? `/${folder.inode_path.path}`
        : `/${folder.resource_id}`

      setPathToIdMap((prev) =>
        new Map(prev).set(folderPath, folder.resource_id),
      )

      setIsNavigatingToFolder(true)

      // navigate
      setCurrentFolderId(folder.resource_id)
      setCurrentFolderPath(folderPath)
      setSelectedItems(new Set())
      updateURL(folderPath)
    },
    [updateURL],
  )

  /**
   * prefetch folder content on hover using consistent caching strategy
   */
  const prefetchFolderContent = useCallback(
    async (folder: File) => {
      if (!connectionId) return

      const prefetchParams = { sort: sortBy, order: sortOrder }
      await prefetch(connectionId, folder.resource_id, prefetchParams)
    },
    [connectionId, sortBy, sortOrder, prefetch],
  )

  /**
   * handle folder hover with debounced prefetch and visual state
   */
  const handleFolderHover = useCallback(
    (folder: File, isEntering: boolean) => {
      if (isEntering) {
        setHoveredFolderId(folder.resource_id)

        // debounce prefetch to avoid excessive requests
        const timeoutId = setTimeout(() => {
          prefetchFolderContent(folder)
        }, 150)

        return () => clearTimeout(timeoutId)
      } else {
        // clear state when leaving
        setHoveredFolderId(null)
      }
    },
    [prefetchFolderContent],
  )

  /**
   * handle item selection (memoized for performance)
   */
  const handleItemSelect = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSelected = new Set(prev)
      if (selected) {
        newSelected.add(itemId)
      } else {
        newSelected.delete(itemId)
      }
      return newSelected
    })
  }, [])

  /**
   * handle select all checkbox (memoized for performance)
   */
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedItems(new Set(filteredItems.map((item) => item.resource_id)))
      } else {
        setSelectedItems(new Set())
      }
    },
    [filteredItems],
  )

  /**
   * handle bulk indexing (memoized and optimistic)
   */
  const handleBulkIndex = useCallback(async () => {
    const itemsToIndex = filteredItems
      .filter(
        (item) =>
          selectedItems.has(item.resource_id) &&
          item.indexedStatus === 'not_indexed',
      )
      .map((item) => ({
        resourceId: item.resource_id,
        resourcePath: item.inode_path.path,
        isFolder: item.inode_type === 'directory',
      }))

    if (itemsToIndex.length > 0) {
      // Use the same key format as useFolderListing hook
      const key = generateFolderCacheKey(
        connectionId || '',
        currentFolderId,
        baseParams,
      )
      setSelectedItems(new Set())
      await indexBulk(itemsToIndex, key)
    }
  }, [
    filteredItems,
    selectedItems,
    connectionId,
    baseParams,
    indexBulk,
    currentFolderId,
  ])

  /**
   * handle bulk deindexing
   */
  const handleBulkDeindex = useCallback(async () => {
    const indexedItems = filteredItems
      .filter(
        (item) =>
          selectedItems.has(item.resource_id) &&
          item.indexedStatus === 'indexed',
      )
      .filter(
        (item) =>
          item.knowledge_base_id &&
          item.knowledge_base_id !== '00000000-0000-0000-0000-000000000000',
      )

    // Group by knowledge base ID since bulk operations require the same KB
    const groupedByKB = indexedItems.reduce(
      (groups, item) => {
        const kbId = item.knowledge_base_id
        if (!kbId) return groups
        if (!groups[kbId]) {
          groups[kbId] = []
        }
        groups[kbId].push({
          resourceId: item.resource_id,
          resourcePath: item.inode_path.path,
        })
        return groups
      },
      {} as Record<string, Array<{ resourceId: string; resourcePath: string }>>,
    )

    const totalItems = Object.values(groupedByKB).flat().length

    if (totalItems > 0) {
      // same key format as useFolderListing hook
      const key = generateFolderCacheKey(
        connectionId || '',
        currentFolderId,
        baseParams,
      )
      setSelectedItems(new Set())

      // each knowledge base group separately
      for (const [kbId, items] of Object.entries(groupedByKB)) {
        await deindexBulk(items, kbId, key)
      }
    }
  }, [
    filteredItems,
    selectedItems,
    connectionId,
    baseParams,
    deindexBulk,
    currentFolderId,
  ])

  const isNavigating =
    isLoading || (currentItems.length === 0 && !isError) || isNavigatingToFolder
  const decodedPathSegments = initialPath.map((segment) =>
    decodeURIComponent(segment),
  )
  const targetFolderPath =
    decodedPathSegments.length > 0 ? `/${decodedPathSegments.join('/')}` : '/'
  const isPathMismatch = targetFolderPath !== currentFolderPath
  const showSkeletonContent =
    (isLoading && currentItems.length === 0) ||
    isNavigatingToFolder ||
    isPathMismatch

  // error state
  if (isError) {
    return (
      <div className="flex-1 flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h3 className="font-medium text-lg">Failed to load files</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {error?.message || 'An unexpected error occurred'}
            </p>
          </div>
          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // only show empty state if we have successfully loaded data and there are no items
  const isEmpty = !isNavigating && filteredItems.length === 0

  const allSelected =
    filteredItems.length > 0 && selectedItems.size === filteredItems.length
  const someSelected =
    selectedItems.size > 0 && selectedItems.size < filteredItems.length

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* search */}
      <div className="bg-[image:radial-gradient(circle,_var(--color-border)_0.5px,_transparent_0.5px)] bg-[size:2.5px_2.5px] bg-[position:0px_0px] px-1.5">
        <div className="bg-background border-b border-x border-border flex items-center justify-between px-2.5 py-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => updateSearch(e.target.value)}
              className="px-11"
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => updateSearch('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-1">
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                <span>Name</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateSort('name', 'asc')}>
                <SortAsc className="h-4 w-4 mr-2" />
                Name (A→Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSort('name', 'desc')}>
                <SortDesc className="h-4 w-4 mr-2" />
                Name (Z→A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-[image:radial-gradient(circle,_var(--color-border)_0.5px,_transparent_0.5px)] bg-[size:2.5px_2.5px] bg-[position:0px_0px] px-1.5">
        <div className="bg-white border-b border-x border-border px-2.5 py-3">
          <Tabs
            value={currentFilter}
            onValueChange={(value: string) => {
              setCurrentFilter(value as typeof currentFilter)
            }}
          >
            <TabsList>
              <TabsTrigger
                value="all"
                className="flex items-center space-x-2 px-4"
              >
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="indexed"
                className="flex items-center space-x-2"
              >
                <span>Indexed</span>
                <AnimatedCounter value={precomputedFilters.indexed.length} />
              </TabsTrigger>
              <TabsTrigger
                value="not_indexed"
                className="flex items-center space-x-2"
              >
                <span>Not Indexed</span>
                <AnimatedCounter
                  value={precomputedFilters.not_indexed.length}
                />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="h-[calc(100dvh-153px)] overflow-auto">
        <div className="bg-[image:radial-gradient(circle,_var(--color-border)_0.5px,_transparent_0.5px)] bg-[size:2.5px_2.5px] bg-[position:0px_0px] px-1.5">
          {/* folders section */}
          {!showSkeletonContent &&
            !isPathMismatch &&
            filteredFolders.length > 0 && (
              <div className="bg-white border-x border-border flex flex-col gap-2 px-6 py-4">
                <h2 className="text-xl font-medium">Folders</h2>
                <div className="flex flex-wrap gap-6">
                  {filteredFolders.map((folder) => (
                    <button
                      key={folder.resource_id}
                      type="button"
                      className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                      onClick={() => handleFolderNavigate(folder)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleFolderNavigate(folder)
                        }
                      }}
                      onMouseEnter={() => {
                        const cleanup = handleFolderHover(folder, true)
                        return cleanup
                      }}
                      onMouseLeave={() => handleFolderHover(folder, false)}
                    >
                      <div className="w-40 h-40 mb-3 flex items-center justify-center transition-all duration-200 ease-in-out overflow-hidden">
                        {hoveredFolderId === folder.resource_id ? (
                          <FolderOpen />
                        ) : (
                          <Folder />
                        )}
                      </div>
                      <div className="text-center w-full">
                        <div
                          className="text-sm font-medium text-foreground mb-1 text-center max-w-full text-ellipsis"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                          title={folder.inode_path?.path || folder.resource_id}
                        >
                          {folder.inode_path?.path ||
                            folder.resource_id ||
                            'Unnamed Folder'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
        <div className="bg-[image:radial-gradient(circle,_var(--color-border)_0.5px,_transparent_0.5px)] bg-[size:2.5px_2.5px] bg-[position:0px_0px] px-1.5">
          {/* file list */}
          <div className="bg-background border-x flex-1 flex flex-col h-full px-2.5 pb-2.5">
            <div className="sticky pt-4 top-0 z-10 bg-white">
              {(filteredFolders.length > 0 ||
                currentFolderPath !== '/' ||
                showSkeletonContent) && (
                <h2 className="text-xl font-medium mb-4 px-4">Documents</h2>
              )}
              <div className="bg-muted/50 border border-dashed border-b-0 flex items-center space-x-4 pl-3.25 pr-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className={
                      someSelected ? 'data-[state=checked]:bg-primary/50' : ''
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">Name</div>
                <div className="w-20 text-right">Size</div>
                <div className="ml-6 w-24 text-right pr-2">Status</div>
              </div>
            </div>
            {showSkeletonContent ? (
              <div className="bg-muted/50 border-b border-dashed border-x p-1">
                <SkeletonRows count={6} />
              </div>
            ) : isEmpty ? (
              <div className="bg-muted/50 border-b border-dashed border-x p-1">
                <div className="bg-background h-full flex-1 flex border rounded-lg items-center justify-center py-20">
                  <div className="text-center space-y-2">
                    <h3 className="font-medium text-lg">No Files Found</h3>
                    <p className="text-muted-foreground text-sm">
                      This folder is empty or no files match your current
                      filters.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              !isPathMismatch &&
              filteredFiles.length > 0 && (
                <div className="bg-muted/50 border-b border-dashed border-x p-1">
                  {filteredFiles.map((file, i) => {
                    const isSelected = selectedItems.has(file.resource_id)

                    // check sibling for selection highlight
                    const prevSelected =
                      i > 0 &&
                      selectedItems.has(filteredFiles[i - 1].resource_id)
                    const nextSelected =
                      i < filteredFiles.length - 1 &&
                      selectedItems.has(filteredFiles[i + 1].resource_id)
                    const isFirstSelected = isSelected && !prevSelected
                    const isLastSelected = isSelected && !nextSelected

                    return (
                      <FileRow
                        key={file.resource_id}
                        item={file}
                        isSelected={isSelected}
                        isFirstSelected={isFirstSelected}
                        isLastSelected={isLastSelected}
                        onSelect={(selected) =>
                          handleItemSelect(file.resource_id, selected)
                        }
                        onFileClick={onFileClick}
                        showCheckbox={true}
                        level={0}
                        onIndex={async () => {
                          const key = generateFolderCacheKey(
                            connectionId || '',
                            currentFolderId,
                            baseParams,
                          )
                          await indexResource(
                            file.resource_id,
                            file.inode_path.path,
                            false,
                            false,
                            key,
                          )
                        }}
                        onDeindex={async () => {
                          const key = generateFolderCacheKey(
                            connectionId || '',
                            currentFolderId,
                            baseParams,
                          )
                          // deindex if file has a valid knowledge base ID
                          if (
                            file.knowledge_base_id &&
                            file.knowledge_base_id !==
                              '00000000-0000-0000-0000-000000000000'
                          ) {
                            await deindexResource(
                              file.resource_id,
                              file.inode_path.path,
                              file.knowledge_base_id,
                              key,
                            )
                          }
                        }}
                        onRemove={async () => {
                          const key = generateFolderCacheKey(
                            connectionId || '',
                            currentFolderId,
                            baseParams,
                          )
                          if (
                            file.knowledge_base_id &&
                            file.knowledge_base_id !==
                              '00000000-0000-0000-0000-000000000000'
                          ) {
                            await deindexResource(
                              file.resource_id,
                              file.inode_path.path,
                              file.knowledge_base_id,
                              key,
                              true,
                            )
                          }
                        }}
                      />
                    )
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      {/* bulk actions */}
      <FloatingToolbar
        selectedCount={selectedItems.size}
        onIndex={handleBulkIndex}
        onDeindex={handleBulkDeindex}
        onClearSelection={() => setSelectedItems(new Set())}
      />
    </div>
  )
}
