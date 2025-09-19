'use client'

import { useRouter } from 'next/navigation'
import { Suspense, use, useCallback } from 'react'
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

  /**
   * handle navigation with router push
   * @param folderPath - target folder path
   */
  const handleNavigate = useCallback(
    (folderPath: string) => {
      const url = buildNavigationUrl(folderPath)
      router.push(url, { scroll: false })
    },
    [router],
  )

  // folder tree component with navigation
  const folderTreeContent = (
    <ExpandableFolderTree
      connectionId={selectedConnectionId}
      currentFolderPath={currentFolderPath}
      onFolderSelect={handleNavigate}
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
          <TopBar
            currentFolderPath={currentFolderPath}
            onNavigate={handleNavigate}
          />
        </Suspense>
      </div>

      {/* file listing */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="p-4">Loading files...</div>}>
          <FileListContainer
            connectionId={selectedConnectionId}
            onFileClick={handleFileClick}
            initialPath={resolvedParams.path || []}
          />
        </Suspense>
      </div>
    </FilePickerLayout>
  )
}
