import { useCallback, useMemo } from 'react'
import { Tree, type TreeDataItem } from '@/components/ui/tree-view'
import { useFolderTreeData } from '@/hooks/useFolderTreeData'
import type { SearchSortParams } from '@/lib/types'
import {
  buildFolderTreeData,
  createCompleteTree,
  Folder,
} from '@/utils/folder-tree-helpers'

export interface BaseFolderTreeProps {
  connectionId: string | null
  currentFolderPath: string
  onFolderSelect: (folderPath: string) => void
  onNavigate?: (folderPath: string, folderId: string | null) => void
  onPrefetch?: (folderId: string) => void
  searchParams?: SearchSortParams
  showChildren?: boolean
  includeHomeIcon?: boolean
  showHeader?: boolean
  className?: string
}

/**
 * loading skeleton for folder tree
 */
function FolderTreeSkeleton() {
  return (
    <div className="px-4 py-2">
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}

/**
 * base folder tree component with configurable behavior
 * @param props
 * @returns
 */
export function BaseFolderTree({
  connectionId,
  currentFolderPath,
  onFolderSelect,
  onNavigate,
  onPrefetch,
  searchParams = {},
  includeHomeIcon = true,
  showHeader = false,
  className = '',
}: BaseFolderTreeProps) {
  // get folder tree data and state
  const { folderDataCache, currentFolderId, rootItems, isLoadingRoot } =
    useFolderTreeData({
      connectionId,
      currentFolderPath,
      searchParams,
    })

  /**
   * build tree data structure
   */
  const folderTreeData = useMemo(() => {
    return buildFolderTreeData(
      folderDataCache,
      currentFolderId,
      currentFolderPath,
      onFolderSelect,
      true,
    )
  }, [folderDataCache, currentFolderPath, onFolderSelect, currentFolderId])

  /**
   * create complete tree with root node
   */
  const treeData = useMemo(() => {
    return createCompleteTree(folderTreeData, onFolderSelect, includeHomeIcon)
  }, [folderTreeData, onFolderSelect, includeHomeIcon])

  /**
   * handle tree item selection
   */
  const handleTreeSelect = useCallback(
    (item: TreeDataItem | undefined) => {
      if (!item) return

      if (item.id === 'root') {
        onFolderSelect('/')
      } else {
        onFolderSelect(item.id)
      }
    },
    [onFolderSelect],
  )

  // Determine the selected item ID (must be before any early returns)
  const selectedItemId = useMemo(() => {
    if (currentFolderPath === '/') {
      return 'root'
    }

    // subfolders use the currentFolderId
    if (currentFolderId !== null && currentFolderId !== undefined) {
      return currentFolderId
    }

    // fallback: folder id from the path mapping
    return undefined
  }, [currentFolderPath, currentFolderId])

  // show loading state while fetching root data
  if (isLoadingRoot && !rootItems.length) {
    return <FolderTreeSkeleton />
  }

  const treeComponent = (
    <Tree
      data={treeData}
      initialSelectedItemId={selectedItemId}
      onSelectChange={handleTreeSelect}
      onNavigate={onNavigate}
      onPrefetch={onPrefetch}
      folderIcon={Folder}
      itemIcon={Folder}
      className={className}
      expandAll={false}
      connectionId={connectionId}
      searchParams={searchParams as Record<string, string | undefined>}
    />
  )

  if (showHeader) {
    return (
      <div className="w-full">
        <div className="border-b border-border p-2 bg-muted/20">
          <h3 className="font-medium text-sm text-muted-foreground">
            Folder Structure
          </h3>
        </div>
        <div className="p-2">{treeComponent}</div>
      </div>
    )
  }

  return treeComponent
}
