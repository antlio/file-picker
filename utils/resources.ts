/**
 * update helpers
 * provides functions to update ui and rollback on errors
 */

import type { File, IndexedStatus } from '@/lib/types'

/**
 * update item status
 * @param items
 * @param itemId
 * @param newStatus
 * @param knowledgeBaseId
 * @returns
 */
export function updateItemStatus(
  items: File[],
  itemId: string,
  newStatus: IndexedStatus,
  knowledgeBaseId?: string,
): File[] {
  return items.map((item) =>
    item.resource_id === itemId
      ? {
          ...item,
          indexedStatus: newStatus,
          // set knowledge base ID when transitioning to indexed (needed for proper status display)
          ...(newStatus === 'indexed' && knowledgeBaseId
            ? { knowledge_base_id: knowledgeBaseId }
            : {}),
        }
      : item,
  )
}

/**
 * remove item from list
 * @param items
 * @param itemId
 * @returns
 */
export function removeItem(items: File[], itemId: string): File[] {
  return items.filter((item) => item.resource_id !== itemId)
}

/**
 * update function for swr mutate
 * @param updateFn
 * @returns
 */
export function createOptimisticUpdate<T>(updateFn: (data: T) => T) {
  return (data: T | undefined) => {
    if (!data) return data
    return updateFn(data)
  }
}

export const createUpdate = createOptimisticUpdate

/**
 * rollback helper that restores previous data
 * @param previousData
 * @returns
 */
export function rollback<T>(previousData: T) {
  return () => previousData
}

/**
 * create a resource action handler with optimistic updates
 * @param mutate
 * @param cache
 * @returns
 */
export function createResourceAction(mutate: any, cache: any) {
  return async <T>(
    parentKey: string,
    optimisticUpdate: (data: T) => T,
    apiCall: () => Promise<any>,
    onSuccess?: (data: T, result?: any) => T,
    onError?: (error: Error) => void,
  ) => {
    // snapshot for rollback
    const currentData = cache.get(parentKey)

    try {
      // update
      mutate(parentKey, createOptimisticUpdate(optimisticUpdate), {
        revalidate: false,
      })

      const result = await apiCall()

      if (onSuccess) {
        mutate(
          parentKey,
          createOptimisticUpdate((data: T) => onSuccess(data, result)),
          { revalidate: false },
        )
      }

      return result
    } catch (error) {
      // rollback on error
      mutate(parentKey, currentData, { revalidate: false })

      if (onError) {
        onError(error as Error)
      }
      throw error
    }
  }
}

/**
 * process resources in batches
 * @param resources
 * @param processor
 * @param batchSize
 */
export async function processBatch<T>(
  resources: T[],
  processor: (resource: T) => Promise<any>,
  batchSize: number = 3,
) {
  for (let i = 0; i < resources.length; i += batchSize) {
    const batch = resources.slice(i, i + batchSize)
    await Promise.all(batch.map(processor))
  }
}
