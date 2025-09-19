/**
 * shared toast helper for resource actions
 * loading, success, and error messaging
 */

import { toast } from 'sonner'

export interface ResourceToastOptions {
  resourceId: string
  resourcePath: string
  action: 'indexing' | 'deindexing' | 'removing'
  retryFn?: () => void
}

/**
 * show loading toast for resource action
 * @param options
 */
export function showResourceLoading({
  resourceId,
  resourcePath,
  action,
}: ResourceToastOptions) {
  const actionText =
    action === 'indexing'
      ? 'Indexing'
      : action === 'deindexing'
        ? 'Deindexing'
        : 'Removing'

  toast.loading(`${actionText} ${resourcePath}...`, {
    id: `${action}-${resourceId}`,
  })
}

/**
 * show success toast for resource action
 * @param options
 */
export function showResourceSuccess({
  resourceId,
  resourcePath,
  action,
}: ResourceToastOptions) {
  const actionText =
    action === 'indexing'
      ? 'indexed'
      : action === 'deindexing'
        ? 'deindexed'
        : 'removed'

  toast.success(`${resourcePath} ${actionText} successfully`, {
    id: `${action}-${resourceId}`,
  })
}

/**
 * show error toast for resource action with retry option
 * @param options
 * @param error
 */
export function showResourceError(
  { resourceId, resourcePath, action, retryFn }: ResourceToastOptions,
  error: Error,
) {
  const actionText =
    action === 'indexing'
      ? 'index'
      : action === 'deindexing'
        ? 'deindex'
        : 'remove'

  toast.error(`Failed to ${actionText} ${resourcePath}: ${error.message}`, {
    id: `${action}-${resourceId}`,
    ...(retryFn && {
      action: {
        label: 'Retry',
        onClick: retryFn,
      },
    }),
  })
}
