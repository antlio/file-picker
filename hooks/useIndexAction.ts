/**
 * hook for indexing operations with updates
 * handles file and folder indexing with job polling
 */

import { useState } from 'react'
import { useSWRConfig } from 'swr'
import {
  showResourceError,
  showResourceLoading,
  showResourceSuccess,
} from '@/helpers/toast'
import { checkJobStatus, startIndex } from '@/lib/api'
import type { ListResourcesResponse } from '@/lib/types'
import {
  createResourceAction,
  processBatch,
  updateItemStatus,
} from '@/utils/resources'

/**
 * hook for managing indexing operations
 * @param connectionId
 * @returns
 */
export function useIndexAction(connectionId: string) {
  const { mutate, cache } = useSWRConfig()
  const executeResourceAction = createResourceAction(mutate, cache)
  const [indexingJobs, setIndexingJobs] = useState<Record<string, string>>({})

  /**
   * index a single file or folder
   * @param resourceId
   * @param resourcePath
   * @param isFolder
   * @param recursive
   * @param parentKey
   */
  const indexResource = async (
    resourceId: string,
    resourcePath: string,
    isFolder: boolean = false,
    recursive: boolean = false,
    parentKey: string = '',
  ) => {
    // show loading toast
    showResourceLoading({ resourceId, resourcePath, action: 'indexing' })

    try {
      const result = await executeResourceAction<ListResourcesResponse>(
        parentKey,
        // update
        (data) => ({
          ...data,
          data: updateItemStatus(data.data, resourceId, 'indexing'),
        }),
        // api call
        async () => {
          const headers = await (
            await import('@/lib/api')
          ).getDefaultAuthHeaders()
          return startIndex(
            connectionId,
            resourceId,
            isFolder,
            recursive,
            headers,
          )
        },
        undefined,
        (error) => {
          showResourceError(
            {
              resourceId,
              resourcePath,
              action: 'indexing',
              retryFn: () =>
                indexResource(
                  resourceId,
                  resourcePath,
                  isFolder,
                  recursive,
                  parentKey,
                ),
            },
            error,
          )
        },
      )

      if (result.jobId) {
        // store job id for polling
        setIndexingJobs((prev) => ({ ...prev, [resourceId]: result.jobId! }))
        // start polling job status
        pollJobStatus(
          result.jobId,
          resourceId,
          resourcePath,
          parentKey,
          result.knowledgeBaseId,
        )
      } else {
        // update to indexed
        await executeResourceAction<ListResourcesResponse>(
          parentKey,
          (data) => data,
          async () => result,
          (data) => ({
            ...data,
            data: updateItemStatus(
              data.data,
              resourceId,
              'indexed',
              result.knowledgeBaseId,
            ),
          }),
        )
        showResourceSuccess({ resourceId, resourcePath, action: 'indexing' })
      }
    } catch (error) {
      // error already handled in executeResourceAction
    }
  }

  /**
   * poll job status until completion
   * @param jobId
   * @param resourceId
   * @param resourcePath
   * @param parentKey
   * @param knowledgeBaseId
   */
  const pollJobStatus = async (
    jobId: string,
    resourceId: string,
    resourcePath: string,
    parentKey: string,
    knowledgeBaseId?: string,
  ) => {
    const maxAttempts = 30
    let attempts = 0

    const poll = async () => {
      try {
        const headers = await (
          await import('@/lib/api')
        ).getDefaultAuthHeaders()
        const status = await checkJobStatus(jobId, headers)

        if (status.status === 'completed') {
          // update to indexed status with knowledge base ID
          await executeResourceAction<ListResourcesResponse>(
            parentKey,
            (data) => data,
            async () => ({}),
            (data) => ({
              ...data,
              data: updateItemStatus(
                data.data,
                resourceId,
                'indexed',
                knowledgeBaseId,
              ),
            }),
          )

          showResourceSuccess({ resourceId, resourcePath, action: 'indexing' })

          // clean up job tracking
          setIndexingJobs((prev) => {
            const { [resourceId]: _, ...rest } = prev
            return rest
          })
        } else if (status.status === 'failed') {
          throw new Error(status.error || 'Indexing failed')
        } else if (attempts < maxAttempts) {
          attempts++
          const delay = Math.min(1000 * 1.5 ** attempts, 10000)
          setTimeout(poll, delay)
        } else {
          throw new Error('Indexing timeout')
        }
      } catch (error) {
        await executeResourceAction<ListResourcesResponse>(
          parentKey,
          (data) => data,
          async () => ({}),
          (data) => ({
            ...data,
            data: updateItemStatus(data.data, resourceId, 'not_indexed'),
          }),
        )

        showResourceError(
          {
            resourceId,
            resourcePath,
            action: 'indexing',
            retryFn: () =>
              indexResource(resourceId, resourcePath, false, false, parentKey),
          },
          error as Error,
        )

        // clean up
        setIndexingJobs((prev) => {
          const { [resourceId]: _, ...rest } = prev
          return rest
        })
      }
    }

    setTimeout(poll, 2000)
  }

  /**
   * index multiple resources in bulk
   * @param resources
   * @param parentKey
   */
  const indexBulk = async (
    resources: Array<{
      resourceId: string
      resourcePath: string
      isFolder: boolean
    }>,
    parentKey: string,
  ) => {
    await processBatch(resources, ({ resourceId, resourcePath, isFolder }) =>
      indexResource(resourceId, resourcePath, isFolder, false, parentKey),
    )
  }

  return {
    indexResource,
    indexBulk,
    indexingJobs,
  }
}
