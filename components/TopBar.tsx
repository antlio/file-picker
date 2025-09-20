'use client'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useNavigationStore } from '@/store/navigationStore'

interface TopBarProps {
  onNavigate?: (folderPath: string, folderId: string | null) => void
}

/**
 * top bar component with breadcrumb navigation
 * provides path navigation for folder hierarchy
 */
export function TopBar({ onNavigate }: TopBarProps) {
  const { currentFolderPath, pathToIdMap } = useNavigationStore()

  const handleBreadcrumbNavigate = (folderPath: string) => {
    // folder ID from path mapping
    const folderId =
      folderPath === '/' ? null : pathToIdMap.get(folderPath) || null
    onNavigate?.(folderPath, folderId)
  }

  return (
    <div className="bg-[image:radial-gradient(circle,_var(--color-border)_0.5px,_transparent_0.5px)] bg-[size:2.5px_2.5px] bg-[position:0px_0px] border-b px-1.5 h-12">
      <div className="bg-background border-x flex items-center justify-start px-2.5 py-2 h-full">
        <Breadcrumbs
          currentFolderPath={currentFolderPath}
          onNavigate={handleBreadcrumbNavigate}
        />
      </div>
    </div>
  )
}
