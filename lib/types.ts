/**
 * core types for the file picker application
 * defines interfaces for connection resources, indexing status, and api responses
 */

export type IndexedStatus = 'indexed' | 'not_indexed' | 'indexing'

/**
 * represents a file or folder item from the connection
 */
export interface File {
  id: string
  resource_id: string
  name: string
  inode_type: 'file' | 'directory'
  inode_path: {
    path: string
  }
  mimeType?: string
  size?: number
  indexedStatus: IndexedStatus
  status?: string
}

/**
 * connection information
 */
export interface Connection {
  connection_id: string
  name: string
  connection_provider: string
  created_at: string
  updated_at: string
}

/**
 * api response for listing resources
 */
export interface ListResourcesResponse {
  data: File[]
  nextPageToken?: string
}

/**
 * api response for indexing operations
 */
export interface IndexResponse {
  jobId?: string
  status: string
  message?: string
}

/**
 * job status response for polling
 */
export interface JobStatusResponse {
  jobId: string
  progress?: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  completedAt?: string
  error?: string
}

/**
 * search and sort parameters for api requests
 */
export interface SearchSortParams {
  q?: string
  sort?: 'name' | 'date'
  order?: 'asc' | 'desc'
  filter?: 'all' | 'indexed' | 'not_indexed'
  pageToken?: string
}

/**
 * knowledge base information
 */
export interface KnowledgeBase {
  knowledge_base_id: string
  name: string
  description?: string
  connection_id: string
  created_at: string
  updated_at: string
}
