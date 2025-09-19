'use client'

import { Breadcrumbs } from '@/components/Breadcrumbs'

interface TopBarProps {
  currentFolderPath?: string
  onNavigate?: (folderPath: string) => void
}

/**
 * top bar component with breadcrumb navigation
 * provides path navigation for folder hierarchy
 */
export function TopBar({ currentFolderPath = '/', onNavigate }: TopBarProps) {
  return (
    <div className="bg-[image:radial-gradient(circle,_var(--color-border)_0.5px,_transparent_0.5px)] bg-[size:2.5px_2.5px] bg-[position:0px_0px] border-b px-1.5 h-12">
      <div className="bg-background border-x flex items-center justify-start px-2.5 py-2 h-full">
        <Breadcrumbs
          currentFolderPath={currentFolderPath}
          onNavigate={onNavigate || (() => {})}
        />
      </div>
    </div>
  )
}
