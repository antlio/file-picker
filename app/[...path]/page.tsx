'use client'

import { useRouter } from 'next/navigation'
import { Suspense, use, useCallback, useRef } from 'react'
import { FileListContainer } from '@/components/FileList'
import { FilePickerLayout } from '@/components/FilePickerLayout'
import { ExpandableFolderTree } from '@/components/FolderTree'
import { TopBar } from '@/components/TopBar'
import { useConnectionSync } from '@/hooks/useConnectionSync'
import { useFileDrawer } from '@/hooks/useFileDrawer'
import { useSearchSort } from '@/hooks/useSearchSort'
import { buildNavigationUrl, decodeFolderPath } from '@/utils/navigation'

interface PathPageProps {
  params: Promise<{
    path: string[]
  }>
}

/**
 * dynamic path-based routing for folder navigation
 */
export default function PathPage({ params }: PathPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { selectedConnectionId, handleConnectionSelect } = useConnectionSync()
  const { selectedFile, isDrawerOpen, handleFileClick, handleCloseDrawer } =
    useFileDrawer()
  const { params: searchParams } = useSearchSort()

  const baseParams = { sort: searchParams.sort, order: searchParams.order }
  const currentFolderPath = decodeFolderPath(resolvedParams.path)
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
   * navigation for folder tree (uses Zustand navigation when available, falls back to router)
   */
  const handleTreeNavigate = useCallback(
    (folderPath: string, folderId: string | null) => {
      // Try Zustand navigation first
      if (navigationRef.current) {
        navigationRef.current(folderPath, folderId)
      } else {
        // Fallback to router navigation
        const url = buildNavigationUrl(folderPath)
        router.push(url, { scroll: false })
      }
      handleCloseDrawer()
    },
    [router, handleCloseDrawer],
  )

  // folder tree component with navigation
  const folderTreeContent = (
    <ExpandableFolderTree
      connectionId={selectedConnectionId}
      currentFolderPath={currentFolderPath}
      onFolderSelect={(folderPath: string) => {
        const folderId = null
        handleTreeNavigate(folderPath, folderId)
      }}
      onNavigate={handleTreeNavigate}
      searchParams={baseParams}
    />
  )

  return (
    <FilePickerLayout
      showFolderTree={true}
      sidebarContent={folderTreeContent}
      onConnectionSelect={handleConnectionSelect}
      selectedFile={selectedFile}
      isDrawerOpen={isDrawerOpen}
      onCloseDrawer={handleCloseDrawer}
    >
      {/* top bar */}
      <div>
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
            initialPath={resolvedParams.path || []}
            onNavigationReady={handleNavigationReady}
          />
        </Suspense>
      </div>
    </FilePickerLayout>
  )
}
