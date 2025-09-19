import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'

/**
 * hook for managing connection selection and data synchronization
 * @returns
 */
export function useConnectionSync() {
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const { mutate } = useSWRConfig()

  /**
   * handle connection selection from sidebar
   * @param connectionId
   */
  const handleConnectionSelect = useCallback((connectionId: string) => {
    setSelectedConnectionId(connectionId)
  }, [])

  /**
   * sync all data by clearing cache and refetching
   */
  const handleSync = useCallback(async () => {
    if (!selectedConnectionId) {
      toast.error('No connection selected')
      return
    }

    setIsSyncing(true)
    try {
      // use mutate with a match function to clear all drive-related cache for this connection
      await mutate(
        (key) => {
          if (
            typeof key === 'string' &&
            key.startsWith(`drive|${selectedConnectionId}|`)
          ) {
            return true
          }
          return false
        },
        undefined,
        { revalidate: true },
      )

      toast.success('Data synced successfully')
    } catch (error) {
      toast.error('Failed to sync data')
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [selectedConnectionId, mutate])

  return {
    selectedConnectionId,
    isSyncing,
    handleConnectionSelect,
    handleSync,
  }
}
