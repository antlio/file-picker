/**
 * hook for deindexing operations with updates
 * handles removing files from knowledge base with rollback on errors
 */

import { useSWRConfig } from 'swr'
import {
  showResourceError,
  showResourceLoading,
  showResourceSuccess,
} from '@/helpers/toast'
import { deindexResource as apiDeindexResource } from '@/lib/api'
import type { ListResourcesResponse } from '@/lib/types'
import {
  createResourceAction,
  processBatch,
  removeItem,
  updateItemStatus,
} from '@/utils/resources'

/**
 * hook for managing deindexing operations
 * @param connectionId
 * @returns
 */
export function useDeindexAction(_connectionId: string) {
  const { mutate, cache } = useSWRConfig()
  const executeResourceAction = createResourceAction(mutate, cache)

  /**
   * deindex a resource (remove from knowledge base)
   * @param resourceId
   * @param resourcePath
   * @param knowledgeBaseId
   * @param parentKey
   * @param removeFromList
   */
  const deindexResource = async (
    resourceId: string,
    resourcePath: string,
    knowledgeBaseId: string,
    parentKey: string,
    removeFromList: boolean = false,
  ) => {
    const action = removeFromList ? 'removing' : 'deindexing'

    // show loading toast
    showResourceLoading({ resourceId, resourcePath, action })

    try {
      await executeResourceAction<ListResourcesResponse>(
        parentKey,
        // update
        (data) => ({
          ...data,
          data: removeFromList
            ? removeItem(data.data, resourceId)
            : updateItemStatus(data.data, resourceId, 'deindexing'),
        }),
        // api call
        async () => {
          const headers = await (
            await import('@/lib/api')
          ).getDefaultAuthHeaders()
          return apiDeindexResource(knowledgeBaseId, resourcePath, headers)
        },
        // success update (only for deindex, not remove)
        !removeFromList
          ? (data) => ({
              ...data,
              data: updateItemStatus(data.data, resourceId, 'not_indexed'),
            })
          : undefined,
        // error handler
        (error) => {
          showResourceError(
            {
              resourceId,
              resourcePath,
              action,
              retryFn: () =>
                deindexResource(
                  resourceId,
                  resourcePath,
                  knowledgeBaseId,
                  parentKey,
                  removeFromList,
                ),
            },
            error,
          )
        },
      )

      // show success toast
      showResourceSuccess({ resourceId, resourcePath, action })
    } catch (_error) {
      // error already handled in executeResourceAction
    }
  }

  /**
   * deindex multiple resources in bulk
   * @param resources
   * @param knowledgeBaseId
   * @param parentKey
   * @param removeFromList
   */
  const deindexBulk = async (
    resources: Array<{ resourceId: string; resourcePath: string }>,
    knowledgeBaseId: string,
    parentKey: string,
    removeFromList: boolean = false,
  ) => {
    await processBatch(resources, ({ resourceId, resourcePath }) =>
      deindexResource(
        resourceId,
        resourcePath,
        knowledgeBaseId,
        parentKey,
        removeFromList,
      ),
    )
  }

  return {
    deindexResource,
    deindexBulk,
  }
}
