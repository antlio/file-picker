import { useEffect, useRef } from 'react'
import type { SearchSortParams } from '@/lib/types'
import { usePrefetchFolder } from './useFolderListing'

/**
 * hook for prefetching folder contents on hover
 * @param connectionId
 * @param resourceId
 * @param params
 * @param delay
 * @returns
 */
export function usePrefetchOnHover(
  connectionId: string | null,
  resourceId: string | null,
  params: SearchSortParams = {},
  delay: number = 200,
) {
  const { prefetch } = usePrefetchFolder()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  /**
   * start prefetch timer on mouse enter
   */
  const handleMouseEnter = () => {
    if (!connectionId || !resourceId) return

    // clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // start new timeout for prefetch
    timeoutRef.current = setTimeout(() => {
      prefetch(connectionId, resourceId, params)
    }, delay)
  }

  /**
   * cancel prefetch timer on mouse leave
   */
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }

  /**
   * cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }
}
