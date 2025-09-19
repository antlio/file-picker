'use client'

import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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

  useEffect(() => {
    if (onConnectionSelect && !selectedConnectionId) {
      // Use a placeholder that matches expected format
      onConnectionSelect('96891794-4313-42f1-9d98-237e526165b8')
      // Set initial sync date
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
          <div className="bg-white w-full justify-start text-left h-auto px-3 py-1.25 rounded-md border">
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
                alt="Google Drive"
                className="h-4 w-4 mr-2 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Google Drive</div>
              </div>

              {/* sync button with tooltip */}
              {onSync && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="h-6 w-6 p-0 ml-2"
                        aria-label="Sync"
                      >
                        <RotateCcw
                          className={`h-2 w-2 ${isSyncing ? 'animate-spin' : ''}`}
                        />
                      </Button>
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
