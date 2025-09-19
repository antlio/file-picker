'use client'

import { ChevronRight, Folder } from 'lucide-react'
import type { File } from '@/lib/types'

interface FolderNavigationProps {
  folders: File[]
  onFolderNavigate: (folder: File) => void
}

/**
 * folder navigation component for displaying folder list
 * @param folders
 * @param onFolderNavigate
 */
export function FolderNavigation({
  folders,
  onFolderNavigate,
}: FolderNavigationProps) {
  if (folders.length === 0) {
    return null
  }

  /**
   * handle keyboard navigation for folder items
   * @param e - keyboard event
   * @param folder - folder item
   */
  const handleKeyDown = (e: React.KeyboardEvent, folder: File) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onFolderNavigate(folder)
    }
  }

  return (
    <div className="border-t border-border">
      <div className="px-4 py-2">
        <h3 className="text-sm font-medium text-muted-foreground">Folders</h3>
      </div>
      <div className="space-y-1 px-2 pb-4">
        {folders.map((folder) => (
          <button
            key={folder.resource_id}
            type="button"
            className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 w-full text-left"
            onClick={() => onFolderNavigate(folder)}
            onKeyDown={(e) => handleKeyDown(e, folder)}
          >
            <Folder className="mr-2 h-4 w-4 text-blue-500" />
            <span className="flex-1 truncate">{folder.inode_path.path}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}
