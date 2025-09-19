'use client'

import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarProps {
  onConnectionSelect?: (Id: string) => void
  selectedConnectionId?: string | null
  onSync?: () => void
  isSyncing?: boolean
}

/**
 * sidebar component for displaying google drive integration
 */
export function Sidebar({
  onConnectionSelect,
  selectedConnectionId,
  onSync,
  isSyncing = false,
}: SidebarProps) {
  // sync date for tooltip
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null)

  /**
   * handle connection click to select/connect
   */
  const handleConnectionClick = () => {
    if (onConnectionSelect) {
      // Use a placeholder that matches expected format
      onConnectionSelect('96891794-4313-42f1-9d98-237e526165b8')
      // Set initial sync date
      setLastSyncDate(new Date())
    }
  }

  // auto-connect immediately to show folder structure
  useEffect(() => {
    if (onConnectionSelect && !selectedConnectionId) {
      // Auto-connect to show folder structure
      onConnectionSelect('96891794-4313-42f1-9d98-237e526165b8')
      setLastSyncDate(new Date())
    }
  }, [onConnectionSelect, selectedConnectionId])

  useEffect(() => {
    if (!isSyncing && lastSyncDate) {
      // update if we were syncing before (sync just completed)
      const wasJustSyncing = Date.now() - lastSyncDate.getTime() < 1000
      if (!wasJustSyncing) {
        setLastSyncDate(new Date())
      }
    }
  }, [isSyncing, lastSyncDate])

  /**
   * handle sync button click
   */
  const handleSync = () => {
    if (onSync && !isSyncing) {
      onSync()
      setLastSyncDate(new Date())
    }
  }

  /**
   * format last sync date for tooltip
   */
  const getLastSyncText = () => {
    if (!lastSyncDate) return 'Never synced'

    const now = new Date()
    const diffMs = now.getTime() - lastSyncDate.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return lastSyncDate.toLocaleDateString()
  }

  return (
    <div>
      <div className="border-b h-12 flex items-center px-4">
        <h1 className="font-semibold text-sm">Integration</h1>
      </div>

      <div className="px-4 py-2">
        <div className="space-y-2">
          <div
            className={`bg-white w-full justify-start text-left h-auto px-3 py-1.25 rounded-md border transition-colors ${
              selectedConnectionId
                ? 'border-green-200 bg-green-50'
                : 'hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleConnectionClick}
                disabled={!!selectedConnectionId}
                className={`flex items-center flex-1 min-w-0 ${selectedConnectionId ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
                  alt="Google Drive"
                  className="h-4 w-4 mr-2 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Google Drive</div>
                  {selectedConnectionId && (
                    <div className="text-xs text-green-600">Connected</div>
                  )}
                </div>
              </button>

              {/* sync button with tooltip */}
              {onSync && selectedConnectionId && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="h-6 w-6 p-0 ml-2 rounded-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label="Sync"
                      >
                        <RotateCcw
                          className={`h-2 w-2 ${isSyncing ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {isSyncing
                          ? 'Syncing...'
                          : `Last sync: ${getLastSyncText()}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
