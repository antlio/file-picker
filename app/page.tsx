'use client'

import { Suspense, useCallback, useState } from 'react'
import { FileListContainer } from '@/components/FileList'
import { FilePickerLayout } from '@/components/FilePickerLayout'
import { TopBar } from '@/components/TopBar'
import { useConnectionSync } from '@/hooks/useConnectionSync'
import { useFileDrawer } from '@/hooks/useFileDrawer'

export default function HomePage() {
  const [currentFolderPath, setCurrentFolderPath] = useState<string>('/')
  const { selectedConnectionId, handleConnectionSelect } = useConnectionSync()
  const { handleFileClick, handleCloseDrawer } = useFileDrawer()

  /**
   * handle breadcrumb navigation from TopBar
   * @param folderPath
   */
  const handleBreadcrumbNavigate = useCallback(
    (folderPath: string) => {
      setCurrentFolderPath(folderPath)
      handleCloseDrawer()
    },
    [handleCloseDrawer],
  )

  /**
   * handle connection selection with folder reset
   * @param connectionId
   */
  const handleConnectionSelectWithReset = useCallback(
    (connectionId: string) => {
      handleConnectionSelect(connectionId)
      setCurrentFolderPath('/')
    },
    [handleConnectionSelect],
  )

  return (
    <FilePickerLayout
      showFolderTree={false}
      onConnectionSelect={handleConnectionSelectWithReset}
    >
      {/* top bar with breadcrumb navigation */}
      <div className="border-border">
        <Suspense fallback={<div className="h-16 bg-muted/20" />}>
          <TopBar
            currentFolderPath={currentFolderPath}
            onNavigate={handleBreadcrumbNavigate}
          />
        </Suspense>
      </div>

      {/* file listing */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="p-4">Loading files...</div>}>
          <FileListContainer
            connectionId={selectedConnectionId}
            onFileClick={handleFileClick}
            initialPath={[]}
          />
        </Suspense>
      </div>
    </FilePickerLayout>
  )
}
