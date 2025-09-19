import type { SearchSortParams } from '@/lib/types'

/**
 * generate consistent cache key for folder listing
 * @param connectionId
 * @param resourceId
 * @param params
 * @returns
 */
export function generateFolderCacheKey(
  connectionId: string,
  resourceId: string | null,
  params: SearchSortParams = {},
): string {
  const normalizedParams = {
    q: params.q || '',
    sort: params.sort || '',
    order: params.order || '',
  }
  return `drive|${connectionId}|${resourceId || 'root'}|${JSON.stringify(normalizedParams)}`
}
