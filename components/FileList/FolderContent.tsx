import { useFolderData } from '@/hooks/useFolderContents'
import type { File, SearchSortParams } from '@/lib/types'
import { FileRow } from './FileRow'

interface FolderContentProps {
  connectionId: string
  folderId: string
  level: number
  params: SearchSortParams
  selectedItems: Set<string>
  onItemSelect: (itemId: string, selected: boolean) => void
  onPrefetchFolder?: (folderId: string) => Promise<void>
  onIndex: (item: File) => Promise<void>
  onDeindex: (item: File) => Promise<void>
  onRemove: (item: File) => Promise<void>
}

/**
 * folder content component that handles expanded folder data
 * displays folder children with proper loading states
 */
export function FolderContent({
  connectionId,
  folderId,
  level,
  params,
  selectedItems,
  onItemSelect,
  onIndex,
  onDeindex,
  onRemove,
}: FolderContentProps) {
  const { data, isLoading, error } = useFolderData(
    connectionId,
    folderId,
    params,
  )

  // show loading skeletons while we don't have data yet or are loading
  if (isLoading || !data?.data) {
    return (
      <>
        {Array.from(
          { length: 5 },
          (_, i) => `skeleton-${folderId}-${level}-${i}`,
        ).map((skeletonId) => (
          <div
            key={skeletonId}
            className="flex items-center space-x-4 p-3 border-b border-border"
            style={{ paddingLeft: `${12 + level * 20}px` }}
          >
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 flex-1 bg-muted animate-pulse rounded max-w-xs" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </>
    )
  }

  // error state
  if (error) {
    return (
      <div
        className="flex items-center space-x-4 p-3 border-b border-border text-destructive"
        style={{ paddingLeft: `${12 + level * 20}px` }}
      >
        <span className="text-sm">Failed to load folder contents</span>
      </div>
    )
  }

  // render folder contents
  return (
    <>
      {data.data.map((item) => (
        <FileRow
          key={item.resource_id}
          item={item}
          isSelected={selectedItems.has(item.resource_id)}
          onSelect={(selected) => onItemSelect(item.resource_id, selected)}
          level={level}
          onIndex={() => onIndex(item)}
          onDeindex={() => onDeindex(item)}
          onRemove={() => onRemove(item)}
        />
      ))}
    </>
  )
}
