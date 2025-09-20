'use client'

import { BaseFolderTree } from '@/components/BaseFolderTree'
import type { SearchSortParams } from '@/lib/types'

interface FolderTreeProps {
  connectionId: string | null
  currentFolderPath: string
  onFolderSelect: (folderPath: string) => void
  onNavigate?: (folderPath: string, folderId: string | null) => void
  onPrefetch?: (folderId: string) => void
  searchParams?: SearchSortParams
}

/**
 * folder tree view component for sidebar navigation
 * shows hierarchical folder structure with header
 */
export function FolderTree({
  connectionId,
  currentFolderPath,
  onFolderSelect,
  onNavigate,
  onPrefetch,
  searchParams = {},
}: FolderTreeProps) {
  return (
    <BaseFolderTree
      connectionId={connectionId}
      currentFolderPath={currentFolderPath}
      onFolderSelect={onFolderSelect}
      onNavigate={onNavigate}
      onPrefetch={onPrefetch}
      searchParams={searchParams}
      showChildren={true}
      includeHomeIcon={true}
      showHeader={true}
      className="w-full"
    />
  )
}

/**
 * expandable folder tree that fetches child folders on demand
 * shows only root and current folder's children without header
 */
export function ExpandableFolderTree({
  connectionId,
  currentFolderPath,
  onFolderSelect,
  onNavigate,
  onPrefetch,
  searchParams = {},
}: FolderTreeProps) {
  return (
    <BaseFolderTree
      connectionId={connectionId}
      currentFolderPath={currentFolderPath}
      onFolderSelect={onFolderSelect}
      onNavigate={onNavigate}
      onPrefetch={onPrefetch}
      searchParams={searchParams}
      showChildren={true}
      includeHomeIcon={false}
      showHeader={false}
      className="border-t mt-[57px] w-full"
    />
  )
}
