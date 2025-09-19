import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { IndexedStatus } from '@/lib/types'

interface IndexButtonProps {
  status: IndexedStatus
  isFolder?: boolean
  onIndex?: () => Promise<void>
  onDeindex?: () => Promise<void>
  onRemove?: () => Promise<void>
  disabled?: boolean
  size?: 'sm' | 'default'
}

/**
 * acion buttons component
 * handles indexing and deindexing operations with loading states
 */
export function IndexButton({
  status,
  onIndex,
  onDeindex,
  disabled = false,
  size = 'sm',
}: IndexButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * handle index action with loading state
   */
  const handleIndex = async () => {
    if (!onIndex || isLoading || disabled) return

    try {
      setIsLoading(true)
      await onIndex()
    } catch (error) {
      console.error('Index failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * handle deindex action with loading state
   */
  const handleDeindex = async () => {
    if (!onDeindex || isLoading || disabled) return

    try {
      setIsLoading(true)
      await onDeindex()
    } catch (error) {
      console.error('Deindex failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // render based on current status
  switch (status) {
    case 'not_indexed':
      return (
        <div className="flex space-x-1">
          <Button
            size={size}
            onClick={handleIndex}
            disabled={disabled || isLoading}
            className="bg-foreground h-fit py-1 text-white"
          >
            Index
          </Button>
        </div>
      )

    case 'indexing':
      return (
        <div className="flex space-x-1">
          <Button
            size={size}
            variant="secondary"
            disabled
            className="bg-blue-100 text-blue-800"
          >
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Indexing
          </Button>
        </div>
      )

    case 'indexed':
      return (
        <div className="flex space-x-1">
          <Button
            size={size}
            variant="outline"
            onClick={handleDeindex}
            disabled={disabled || isLoading}
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            Deindex
          </Button>
        </div>
      )

    default:
      return null
  }
}
