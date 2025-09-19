/**
 * hook for managing search and sort state
 * handles url query parameters and debounced search
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import type { SearchSortParams } from '@/lib/types'

/**
 * hook for managing search, sort, and filter state
 * @returns search/sort state and updater functions
 */
export function useSearchSort() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // local state for immediate ui updates
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState<'all' | 'indexed' | 'not_indexed'>('all')

  // initialize from url params (exclude filter for instant switching)
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const sort = (searchParams.get('sort') as 'name' | 'date') || 'name'
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'asc'

    setSearchQuery(q)
    setSortBy(sort)
    setSortOrder(order)
    // Keep filter as local state only - don't sync with URL
  }, [searchParams])

  // debounced search to avoid excessive api calls
  const debouncedUpdateUrl = useDebouncedCallback(
    (params: Record<string, string>) => {
      const url = new URL(window.location.href)

      // update search params
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value)
        } else {
          url.searchParams.delete(key)
        }
      })

      router.push(url.pathname + url.search, { scroll: false })
    },
    300,
  )

  /**
   * update search query with debounced url update
   */
  const updateSearch = (query: string) => {
    setSearchQuery(query)
    debouncedUpdateUrl({
      q: query,
    })
  }

  /**
   * update sort parameters (local state only, no URL update)
   */
  const updateSort = (sort: 'name' | 'date', order: 'asc' | 'desc') => {
    setSortBy(sort)
    setSortOrder(order)
  }

  /**
   * update filter (no URL update for instant switching)
   */
  const updateFilter = (newFilter: typeof filter) => {
    setFilter(newFilter)
  }

  /**
   * clear all filters and search
   */
  const clearAll = () => {
    setSearchQuery('')
    setSortBy('name')
    setSortOrder('asc')
    setFilter('all')
    router.push(window.location.pathname, { scroll: false })
  }

  // memoized params object for api calls
  const params = useMemo(
    (): SearchSortParams => ({
      q: searchQuery || undefined,
      sort: sortBy,
      order: sortOrder,
      filter: filter !== 'all' ? filter : undefined,
    }),
    [searchQuery, sortBy, sortOrder, filter],
  )

  return {
    searchQuery,
    sortBy,
    sortOrder,
    filter,
    params,
    updateSearch,
    updateSort,
    updateFilter,
    clearAll,
  }
}
