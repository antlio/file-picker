import { isValidKnowledgeBaseId } from '@/utils/knowledgeBase'
import type {
  Connection,
  IndexedStatus,
  IndexResponse,
  JobStatusResponse,
  KnowledgeBase,
  ListResourcesResponse,
  SearchSortParams,
} from './types'

const BACKEND_URL = 'https://api.stack-ai.com'

// cache for connections list to avoid repeated API calls
const connectionsCache = {
  data: null as Connection[] | null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes TTL
}

// cache for knowledge bases to avoid recreating them
const knowledgeBaseCache = new Map<string, KnowledgeBase>()

// cache for authentication tokens to avoid repeated auth requests
const authTokenCache = {
  token: null as string | null,
  timestamp: 0,
  ttl: 55 * 60 * 1000,
}

/**
 * clear all caches (for testing purposes)
 */
export function clearCaches() {
  connectionsCache.data = null
  connectionsCache.timestamp = 0
  knowledgeBaseCache.clear()
  authTokenCache.token = null
  authTokenCache.timestamp = 0
}

/**
 * get authentication headers for stackai api
 * @param email - user email
 * @param password - user password
 * @returns authorization headers
 */
export async function getAuthHeaders(
  email: string,
  password: string,
): Promise<Record<string, string>> {
  // check if we have a cached token that's still valid
  const now = Date.now()
  if (
    authTokenCache.token &&
    now - authTokenCache.timestamp < authTokenCache.ttl
  ) {
    return {
      Authorization: `Bearer ${authTokenCache.token}`,
    }
  }

  const supabaseAuthUrl = 'https://sb.stack-ai.com'
  const anonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3VhZGZxaGtseG9rbWxodHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM0NTg5ODAsImV4cCI6MTk4OTAzNDk4MH0.Xjry9m7oc42_MsLRc1bZhTTzip3srDjJ6fJMkwhXQ9s'

  const requestUrl = `${supabaseAuthUrl}/auth/v1/token?grant_type=password`
  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Apikey: anonKey,
    },
    body: JSON.stringify({
      email,
      password,
      gotrue_meta_security: {},
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()

    throw new Error(
      `Authentication failed: ${response.statusText} - ${errorText}`,
    )
  }

  const data = await response.json()

  // cache the token
  authTokenCache.token = data.access_token
  authTokenCache.timestamp = now

  return {
    Authorization: `Bearer ${data.access_token}`,
  }
}

/**
 * get current organization id
 * @param headers - auth headers
 * @returns organization id
 */
export async function getOrgId(
  headers: Record<string, string>,
): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/organizations/me/current`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to get org ID: ${response.statusText}`)
  }

  const data = await response.json()
  return data.org_id
}

/**
 * list google drive connections for the user with caching
 * @param headers - auth headers
 * @returns list of connections
 */
export async function listConnections(
  headers: Record<string, string>,
): Promise<Connection[]> {
  // check cache first
  const now = Date.now()
  if (
    connectionsCache.data &&
    now - connectionsCache.timestamp < connectionsCache.ttl
  ) {
    return connectionsCache.data
  }

  const url = `${BACKEND_URL}/connections?connection_provider=gdrive&limit=10`
  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`Failed to list connections: ${response.statusText}`)
  }

  const data = await response.json()

  // update cache
  connectionsCache.data = data
  connectionsCache.timestamp = now

  return data
}

/**
 * get resource metadata by resource IDs
 * @param connectionId - connection identifier
 * @param resourceIds - array of resource IDs to get metadata for
 * @param headers - auth headers
 * @returns resource metadata
 */
export async function getResourceMetadata(
  connectionId: string,
  resourceIds: string[],
  headers: Record<string, string>,
): Promise<any[]> {
  const url = new URL(`${BACKEND_URL}/connections/${connectionId}/resources`)
  url.searchParams.set('resource_ids', resourceIds.join(','))

  const response = await fetch(url.toString(), { headers })

  if (!response.ok) {
    throw new Error(`Failed to get resource metadata: ${response.statusText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : [data]
}

/**
 * list resources in a connection folder
 * @param connectionId - connection identifier
 * @param resourceId - parent folder resource id (null for root)
 * @param params - search and sort parameters
 * @param headers - auth headers
 * @returns list of resources
 */
export async function listResources(
  connectionId: string,
  resourceId: string | null,
  params: SearchSortParams = {},
  headers: Record<string, string>,
): Promise<ListResourcesResponse> {
  const url = new URL(
    `${BACKEND_URL}/connections/${connectionId}/resources/children`,
  )

  if (resourceId) {
    url.searchParams.set('resource_id', resourceId)
  }

  if (params.q) {
    url.searchParams.set('q', params.q)
  }

  if (params.sort) {
    url.searchParams.set('sort', params.sort)
  }

  if (params.order) {
    url.searchParams.set('order', params.order)
  }

  if (params.pageToken) {
    url.searchParams.set('pageToken', params.pageToken)
  }

  const response = await fetch(url.toString(), { headers })

  if (!response.ok) {
    throw new Error(`Failed to list resources: ${response.statusText}`)
  }

  const data = await response.json()

  const mappedData = (data.data || data).map((item: any) => {
    let mappedStatus: IndexedStatus = 'not_indexed'

    const status = item.indexedStatus || item.indexed_status || item.status

    // determine status based on knowledge base association and status field
    const hasValidKnowledgeBase = isValidKnowledgeBaseId(item.knowledge_base_id)

    if (
      item.indexedStatus === 'indexing' ||
      item.indexedStatus === 'deindexing'
    ) {
      mappedStatus = item.indexedStatus
    } else if (item.indexedStatus === 'indexed') {
      mappedStatus = 'indexed'
    } else if (status === 'indexing' || status === 'pending') {
      mappedStatus = 'indexing'
    } else if (status === 'indexed') {
      mappedStatus = 'indexed'
    } else if (hasValidKnowledgeBase) {
      mappedStatus = 'indexed'
    } else {
      mappedStatus = 'not_indexed'
    }

    return {
      ...item,
      indexedStatus: mappedStatus,
    }
  })

  return {
    data: mappedData,
    nextPageToken: data.nextPageToken,
  }
}

/**
 * create or get knowledge base for indexing
 * @param connectionId - connection identifier
 * @param headers - auth headers
 * @returns knowledge base information
 */
export async function getOrCreateKnowledgeBase(
  connectionId: string,
  headers: Record<string, string>,
): Promise<KnowledgeBase> {
  // check cache first to avoid unnecessary KB creation
  const cached = knowledgeBaseCache.get(connectionId)
  if (cached) {
    return cached
  }

  // try to find existing knowledge base first
  try {
    const listUrl = `${BACKEND_URL}/knowledge_bases?connection_id=${connectionId}&limit=1`
    const listResponse = await fetch(listUrl, { headers })

    if (listResponse.ok) {
      const existingKbs = await listResponse.json()
      if (existingKbs.length > 0) {
        const kb = existingKbs[0]
        knowledgeBaseCache.set(connectionId, kb)
        return kb
      }
    }
  } catch (error) {
    console.warn(
      'Failed to check existing knowledge bases, creating new one:',
      error,
    )
  }

  // create new KB only if none exists
  const createUrl = `${BACKEND_URL}/knowledge_bases`

  const data = {
    connection_id: connectionId,
    connection_source_ids: [],
    name: `File Picker KB ${Date.now()}`,
    description: 'Knowledge base created from file picker',
    indexing_params: {
      ocr: false,
      unstructured: true,
      embedding_params: {
        embedding_model: 'text-embedding-ada-002',
        api_key: null,
      },
      chunker_params: {
        chunk_size: 1500,
        chunk_overlap: 500,
        chunker: 'sentence',
      },
    },
    org_level_role: null,
    cron_job_id: null,
  }

  const response = await fetch(createUrl, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to create knowledge base: ${response.statusText}`)
  }

  const kb = await response.json()
  knowledgeBaseCache.set(connectionId, kb)
  return kb
}

/**
 * start indexing a file or folder
 * @param connectionId - connection identifier
 * @param resourceId - resource to index
 * @param isFolder - whether the resource is a folder
 * @param recursive - index folder recursively
 * @param headers - auth headers
 * @returns indexing job information
 */
export async function startIndex(
  connectionId: string,
  _resourceId: string,
  _isFolder = false,
  _recursive = false,
  headers: Record<string, string>,
): Promise<IndexResponse> {
  // first, get or create a knowledge base
  const kb = await getOrCreateKnowledgeBase(connectionId, headers)

  // trigger sync for the knowledge base
  const orgId = await getOrgId(headers)
  const syncUrl = `${BACKEND_URL}/knowledge_bases/sync/trigger/${kb.knowledge_base_id}/${orgId}`

  const response = await fetch(syncUrl, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to start indexing: ${response.statusText}`)
  }

  return {
    jobId: `sync-${kb.knowledge_base_id}`,
    status: 'started',
    message: 'Indexing started successfully',
    knowledgeBaseId: kb.knowledge_base_id,
  }
}

/**
 * remove a file from knowledge base (deindex)
 * @param knowledgeBaseId - knowledge base identifier
 * @param resourcePath - path to the resource
 * @param headers - auth headers
 * @returns deindex result
 */
export async function deindexResource(
  knowledgeBaseId: string,
  resourcePath: string,
  headers: Record<string, string>,
): Promise<IndexResponse> {
  const url = new URL(
    `${BACKEND_URL}/knowledge_bases/${knowledgeBaseId}/resources`,
  )
  url.searchParams.set('resource_path', resourcePath)

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resource_path: resourcePath }),
  })

  if (!response.ok) {
    throw new Error(`Failed to deindex resource: ${response.statusText}`)
  }

  return {
    status: 'deindexed',
    message: 'Resource removed from knowledge base',
  }
}

/**
 * check indexing job status
 * @param jobId - job identifier
 * @param headers - auth headers
 * @returns job status
 */
export async function checkJobStatus(
  jobId: string,
  _headers: Record<string, string>,
): Promise<JobStatusResponse> {
  // for this demo, we'll simulate job completion
  // in a real implementation, you'd have actual job status endpoints
  return {
    jobId,
    status: 'completed',
    progress: 100,
    completedAt: new Date().toISOString(),
  }
}

/**
 * fetch file content from google drive
 * @param connectionId - connection identifier
 * @param resourceId - file resource id
 * @param headers - auth headers
 * @returns file content as text or blob
 */
export async function fetchFileContent(
  connectionId: string,
  resourceId: string,
  headers: Record<string, string>,
): Promise<{ content: string; mimeType: string }> {
  const endpoints = [
    `${BACKEND_URL}/connections/${connectionId}/resources/${resourceId}/content`,
    `${BACKEND_URL}/connections/${connectionId}/resources/${resourceId}/download`,
    `${BACKEND_URL}/connections/${connectionId}/resources/download?resource_id=${resourceId}`,
  ]

  // try all endpoints in parallel for faster response
  const promises = endpoints.map(async (url) => {
    const response = await fetch(url, {
      headers: {
        ...headers,
        Accept:
          'text/plain, application/pdf, application/json, text/*, image/*, application/octet-stream',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const mimeType = response.headers.get('content-type') || 'text/plain'

    // handle different content types
    if (
      mimeType.includes('application/pdf') ||
      mimeType.includes('application/octet-stream')
    ) {
      const arrayBuffer = await response.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      return {
        content: `data:${mimeType};base64,${base64}`,
        mimeType,
      }
    } else if (mimeType.includes('image/')) {
      const arrayBuffer = await response.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      return {
        content: `data:${mimeType};base64,${base64}`,
        mimeType,
      }
    } else {
      const content = await response.text()
      return {
        content,
        mimeType,
      }
    }
  })

  // wait for first successful response
  try {
    const results = await Promise.allSettled(promises)

    // find first successful result
    for (const result of results) {
      if (result.status === 'fulfilled') {
        return result.value
      }
    }

    // if all failed, throw error from the last attempt
    const errors = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected',
      )
      .map((result) => result.reason.message)

    throw new Error(`All file content endpoints failed: ${errors.join(', ')}`)
  } catch (error) {
    console.warn('Failed to fetch file content:', error)
    throw error
  }
}

/**
 * get auth headers
 */
export async function getDefaultAuthHeaders(): Promise<Record<string, string>> {
  const email = process.env.NEXT_PUBLIC_STACKAI_EMAIL
  const password = process.env.NEXT_PUBLIC_STACKAI_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Missing authentication credentials. Please set NEXT_PUBLIC_STACKAI_EMAIL and NEXT_PUBLIC_STACKAI_PASSWORD in your .env file.',
    )
  }

  return getAuthHeaders(email, password)
}
