'use client'

import { type ReactNode, Suspense } from 'react'
import { FileContentDrawer } from '@/components/FileContentDrawer'
import { Sidebar } from '@/components/Sidebar'
import { useConnectionSync } from '@/hooks/useConnectionSync'
import { useFileDrawer } from '@/hooks/useFileDrawer'
import type { File } from '@/lib/types'

interface FilePickerLayoutProps {
  children: ReactNode
  sidebarContent?: ReactNode
  showFolderTree?: boolean
  onConnectionSelect?: (connectionId: string) => void
  // File drawer props - if provided, use external state instead of internal
  selectedFile?: File | null
  isDrawerOpen?: boolean
  onCloseDrawer?: () => void
}

/**
 * shared layout component for file picker pages
 */
export function FilePickerLayout({
  children,
  sidebarContent,
  showFolderTree = false,
  onConnectionSelect,
  selectedFile: externalSelectedFile,
  isDrawerOpen: externalIsDrawerOpen,
  onCloseDrawer: externalOnCloseDrawer,
}: FilePickerLayoutProps) {
  const {
    selectedConnectionId,
    isSyncing,
    handleConnectionSelect,
    handleSync,
  } = useConnectionSync()
  const {
    selectedFile: internalSelectedFile,
    isDrawerOpen: internalIsDrawerOpen,
    handleCloseDrawer: internalHandleCloseDrawer,
  } = useFileDrawer()

  // use external file drawer state if provided, otherwise use internal
  const selectedFile =
    externalSelectedFile !== undefined
      ? externalSelectedFile
      : internalSelectedFile
  const isDrawerOpen =
    externalIsDrawerOpen !== undefined
      ? externalIsDrawerOpen
      : internalIsDrawerOpen
  const handleCloseDrawer = externalOnCloseDrawer || internalHandleCloseDrawer

  // use custom handlers if provided, otherwise use default hooks
  const connectionSelectHandler = onConnectionSelect || handleConnectionSelect

  return (
    <div className="flex h-screen bg-background">
      {/* sidebar */}
      <div
        className={`border-r border-border ${showFolderTree ? 'w-64 flex flex-col' : 'w-64'}`}
      >
        <Sidebar
          onConnectionSelect={connectionSelectHandler}
          selectedConnectionId={selectedConnectionId}
          onSync={handleSync}
          isSyncing={isSyncing}
        />

        {/* optional folder tree or additional sidebar content */}
        {showFolderTree && sidebarContent && (
          <div className="flex-1 overflow-auto">
            <Suspense
              fallback={<div className="p-4">Loading folder tree...</div>}
            >
              {sidebarContent}
            </Suspense>
          </div>
        )}
      </div>

      {/* main content area */}
      <div className="flex-1 flex flex-col">
        {/* content with drawer */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-hidden">{children}</div>

          {/* file content drawer */}
          <FileContentDrawer
            file={selectedFile}
            connectionId={selectedConnectionId}
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
          />
        </div>
      </div>
    </div>
  )
}
