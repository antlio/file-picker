import { useCallback, useRef } from 'react'

/**
 * hook for folder prefetching with hover delay and cancellation
 * @param onPrefetch
 * @param delay
 * @returns
 */
export function useFolderPrefetch(
  onPrefetch?: (folderId: string) => Promise<void>,
  delay: number = 200,
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isHoveringRef = useRef(false)

  /**
   * start prefetch timer on mouse enter
   */
  const handleMouseEnter = useCallback(
    (folderId: string) => {
      if (!onPrefetch) return

      isHoveringRef.current = true

      // clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // start new timeout for prefetch
      timeoutRef.current = setTimeout(async () => {
        // only prefetch if still hovering
        if (isHoveringRef.current) {
          try {
            await onPrefetch(folderId)
          } catch (error) {
            console.error('Prefetch failed:', error)
          }
        }
      }, delay)
    },
    [onPrefetch, delay],
  )

  /**
   * cancel prefetch timer on mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }, [])

  /**
   * cleanup on unmount
   */
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    handleMouseEnter,
    handleMouseLeave,
    cleanup,
  }
}
