/**
 * core types for the file picker application
 * defines interfaces for connection resources, indexing status, and api responses
 */

export type IndexedStatus =
  | 'indexed'
  | 'not_indexed'
  | 'indexing'
  | 'deindexing'

/**
 * represents a file or folder item from the connection
 */
export interface File {
  id: string
  resource_id: string
  inode_type: 'file' | 'directory'
  inode_path: {
    path: string
  }
  content_mime?: string
  size?: number
  indexedStatus: IndexedStatus
  status?: string
  knowledge_base_id?: string
  dataloader_metadata?: {
    created_at: string
    created_by: string
    last_modified_at: string
    last_modified_by: string
    path: string
    web_url: string
  }
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
  knowledgeBaseId?: string
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
