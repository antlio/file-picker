'use client'

import { Suspense, useCallback, useRef } from 'react'
import { FileListContainer } from '@/components/FileList'
import { FilePickerLayout } from '@/components/FilePickerLayout'
import { ExpandableFolderTree } from '@/components/FolderTree'
import { TopBar } from '@/components/TopBar'
import { useConnectionSync } from '@/hooks/useConnectionSync'
import { useFileDrawer } from '@/hooks/useFileDrawer'
import { useSearchSort } from '@/hooks/useSearchSort'
import { useNavigationStore } from '@/store/navigationStore'

function HomePageContent() {
  const { selectedConnectionId, handleConnectionSelect } = useConnectionSync()
  const { selectedFile, isDrawerOpen, handleFileClick, handleCloseDrawer } =
    useFileDrawer()
  const { params: searchParams } = useSearchSort()
  const { currentFolderPath } = useNavigationStore()

  // Store reference to navigation function from FileListContainer
  const navigationRef = useRef<
    ((folderPath: string, folderId: string | null) => void) | null
  >(null)

  /**
   * handle breadcrumb navigation from TopBar
   */
  const handleBreadcrumbNavigate = useCallback(
    (folderPath: string, folderId: string | null) => {
      if (navigationRef.current) {
        navigationRef.current(folderPath, folderId)
      } else {
        console.error('Page: No navigation function available!')
      }
      handleCloseDrawer()
    },
    [handleCloseDrawer],
  )

  /**
   * receive navigation function from FileListContainer
   */
  const handleNavigationReady = useCallback(
    (
      handleFolderNavigate: (
        folderPath: string,
        folderId: string | null,
      ) => void,
    ) => {
      navigationRef.current = handleFolderNavigate
    },
    [],
  )

  /**
   * navigation for folder tree
   */
  const handleTreeNavigate = useCallback(
    (folderPath: string, folderId: string | null) => {
      if (navigationRef.current) {
        navigationRef.current(folderPath, folderId)
      }
      handleCloseDrawer()
    },
    [handleCloseDrawer],
  )

  /**
   * handle connection selection with folder reset
   */
  const handleConnectionSelectWithReset = useCallback(
    (connectionId: string) => {
      handleConnectionSelect(connectionId)
    },
    [handleConnectionSelect],
  )

  const baseParams = { sort: searchParams.sort, order: searchParams.order }

  // folder tree component with navigation
  const folderTreeContent = (
    <ExpandableFolderTree
      connectionId={selectedConnectionId}
      currentFolderPath={currentFolderPath}
      onFolderSelect={() => {
        // should use onNavigate instead
      }}
      onNavigate={handleTreeNavigate}
      searchParams={baseParams}
    />
  )

  return (
    <FilePickerLayout
      showFolderTree={true}
      sidebarContent={folderTreeContent}
      onConnectionSelect={handleConnectionSelectWithReset}
      selectedFile={selectedFile}
      isDrawerOpen={isDrawerOpen}
      onCloseDrawer={handleCloseDrawer}
    >
      {/* top bar with breadcrumb navigation */}
      <div className="border-border">
        <Suspense fallback={<div className="h-16 bg-muted/20" />}>
          <TopBar onNavigate={handleBreadcrumbNavigate} />
        </Suspense>
      </div>

      {/* file listing */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="p-4">Loading files...</div>}>
          <FileListContainer
            connectionId={selectedConnectionId}
            onFileClick={handleFileClick}
            initialPath={[]}
            onNavigationReady={handleNavigationReady}
          />
        </Suspense>
      </div>
    </FilePickerLayout>
  )
}

export default function HomePage() {
  return <HomePageContent />
}
