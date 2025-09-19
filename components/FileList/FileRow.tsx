import { File as FileIcon } from 'lucide-react'
import { memo, useRef, useState } from 'react'
import FileCsv from '@/assets/FileCsv'
import FilePdf from '@/assets/FilePdf'
import FileTxt from '@/assets/FileTxt'
import { IndexButton } from '@/components/ActionButton'
import { StatusPill } from '@/components/StatusPill'
import { Checkbox } from '@/components/ui/checkbox'
import type { File } from '@/lib/types'
import { formatBytes } from '@/utils/format'

interface FileRowProps {
  item: File
  isSelected?: boolean
  isFirstSelected?: boolean
  isLastSelected?: boolean
  onSelect?: (selected: boolean) => void
  onIndex?: () => Promise<void>
  onDeindex?: () => Promise<void>
  onRemove?: () => Promise<void>
  onClick?: () => void
  onFileClick?: (file: File) => void
  onHover?: () => () => void
  showCheckbox?: boolean
  level?: number
}

/**
 * file row component for displaying individual files and folders
 * includes selection, status, and action buttons
 */
export const FileRow = memo(function FileRow({
  item,
  isSelected = false,
  isFirstSelected = false,
  isLastSelected = false,
  onSelect,
  onIndex,
  onDeindex,
  onRemove,
  onClick,
  onFileClick,
  onHover,
  showCheckbox = true,
}: FileRowProps) {
  const isFolder = item.inode_type === 'directory'
  const [isHovered, setIsHovered] = useState(false)

  /**
   * get file icon based on file extension and mime type
   */
  const getFileIcon = () => {
    const mimeType = item.content_mime?.toLowerCase() || ''

    switch (mimeType) {
      default:
        if (mimeType.includes('text/csv')) {
          return <FileCsv className="h-6 w-6" />
        }
        if (mimeType.includes('application/pdf')) {
          return <FilePdf className="h-6 w-6" />
        }
        if (mimeType.includes('text/plain')) {
          return <FileTxt className="h-6 w-6" />
        }

        // fallback to generic file icon
        return <FileIcon className="h-6 w-6" />
    }
  }

  /**
   * should show checkbox instead of icon
   */
  const shouldShowCheckbox = showCheckbox && (isHovered || isSelected)

  // hover handling for folders (prefetch on hover)
  const hoverCleanupRef = useRef<(() => void) | null>(null)

  /**
   * combined hover handling for both prefetch and checkbox display
   */
  const handleMouseEnter = () => {
    setIsHovered(true)

    // folder prefetch if applicable
    if (isFolder && onHover) {
      // clear any existing timeout
      if (hoverCleanupRef.current) {
        hoverCleanupRef.current()
      }
      // start new hover with cleanup function
      hoverCleanupRef.current = onHover()
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)

    // cleanup function to cancel prefetch if needed
    if (hoverCleanupRef.current) {
      hoverCleanupRef.current()
      hoverCleanupRef.current = null
    }
  }

  /**
   * handle row click for folders (navigation) or files (content viewing)
   */
  const handleRowClick = () => {
    if (isFolder && onClick) {
      onClick()
    } else if (!isFolder && onFileClick) {
      onFileClick(item)
    }
  }

  /**
   * handle checkbox change
   */
  const handleSelectChange = (checked: boolean) => {
    onSelect?.(checked)
  }

  const rowContent = (
    // biome-ignore lint/a11y/useSemanticElements: complex layout requires div with specific css properties
    <div
      role="button"
      tabIndex={0}
      className={`
        bg-white relative flex items-center gap-2.75 p-3 pl-2.25
        hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg
        ${isSelected ? 'border-x border-foreground' : 'border-x'}
        ${isFirstSelected ? 'border-t border-foreground rounded-t-lg' : 'first:border-t'}
        ${isLastSelected ? 'border-b border-foreground rounded-b-lg' : 'last:border-b'}
        ${isFolder || onFileClick ? 'cursor-pointer' : ''}
      `}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleRowClick()
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="relative flex flex-shrink-0 items-center w-6 h-6 after:content-[''] after:absolute after:inset-[-12px] border-0 bg-transparent p-0"
        onClick={(e) => {
          e.stopPropagation()
          handleSelectChange(!isSelected)
        }}
      >
        {shouldShowCheckbox ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectChange}
            onClick={(e) => e.stopPropagation()}
            className="relative flex-shrink-0"
          />
        ) : (
          getFileIcon()
        )}
      </button>

      {/* name */}
      <div className="flex-1 min-w-0">
        <div
          className="font-medium text-sm truncate select-none"
          title={item.inode_path.path}
        >
          {item.inode_path.path}
        </div>
      </div>

      {/* size */}
      <div className="w-20 text-sm text-muted-foreground text-right">
        {!isFolder && item.size ? formatBytes(item.size) : '—'}
      </div>

      {/* status */}
      <div className="ml-6 w-24 flex justify-end">
        <StatusPill status={item.indexedStatus} />
      </div>

      {/* cta */}
      {isHovered && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center bg-muted/50 pl-20 rounded-r-lg"
          style={{
            background:
              'linear-gradient(to right, transparent 0%, var(--muted) 30%, var(--muted) 100%)',
          }}
        >
          <div className="px-2">
            <IndexButton
              status={item.indexedStatus}
              isFolder={isFolder}
              onIndex={onIndex}
              onDeindex={onDeindex}
              onRemove={onRemove}
            />
          </div>
        </div>
      )}
    </div>
  )

  return rowContent
})
