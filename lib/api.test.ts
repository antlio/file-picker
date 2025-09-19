import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkJobStatus,
  clearCaches,
  deindexResource,
  fetchFileContent,
  getAuthHeaders,
  getDefaultAuthHeaders,
  getOrCreateKnowledgeBase,
  getOrgId,
  listConnections,
  listResources,
  startIndex,
} from './api'

// mock fetch globally
global.fetch = vi.fn()

/**
 * create a mock response object with all required Response properties
 */
function createMockResponse(overrides: Partial<Response> = {}): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    body: null,
    bodyUsed: false,
    json: async () => ({}),
    text: async () => '',
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    clone: () => createMockResponse(overrides),
    ...overrides,
  } as Response
}

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearCaches()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getAuthHeaders', () => {
    it('should successfully authenticate and return Bearer token', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          access_token: 'test-access-token',
          token_type: 'bearer',
          expires_in: 3600,
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = await getAuthHeaders('test@example.com', 'password123')

      expect(fetch).toHaveBeenCalledWith(
        'https://sb.stack-ai.com/auth/v1/token?grant_type=password',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Apikey: expect.stringContaining(
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            ),
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            gotrue_meta_security: {},
          }),
        }),
      )

      expect(headers).toEqual({
        Authorization: 'Bearer test-access-token',
      })
    })

    it('should throw error when authentication fails', async () => {
      const mockResponse = createMockResponse({
        ok: false,
        statusText: 'Unauthorized',
      })

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

      await expect(
        getAuthHeaders('invalid@example.com', 'wrong-password'),
      ).rejects.toThrow('Authentication failed: Unauthorized')
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(
        getAuthHeaders('test@example.com', 'password123'),
      ).rejects.toThrow('Network error')
    })
  })

  describe('getOrgId', () => {
    it('should successfully get organization ID', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          org_id: 'org_12345',
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = { Authorization: 'Bearer test-token' }
      const orgId = await getOrgId(headers)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.stack-ai.com/organizations/me/current',
        { headers },
      )
      expect(orgId).toBe('org_12345')
    })

    it('should throw error when request fails', async () => {
      const mockResponse = createMockResponse({
        ok: false,
        statusText: 'Forbidden',
      })

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

      const headers = { Authorization: 'Bearer invalid-token' }

      await expect(getOrgId(headers)).rejects.toThrow(
        'Failed to get org ID: Forbidden',
      )
    })
  })

  describe('listConnections', () => {
    it('should successfully list Google Drive connections', async () => {
      const mockConnections = [
        {
          connection_id: '96891794-4313-42f1-9d98-237e526165b8',
          name: 'My Google Drive',
          connection_provider: 'gdrive',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockResponse = {
        ok: true,
        json: async () => mockConnections,
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = { Authorization: 'Bearer test-token' }
      const connections = await listConnections(headers)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.stack-ai.com/connections?connection_provider=gdrive&limit=10',
        { headers },
      )
      expect(connections).toEqual(mockConnections)
    })

    it('should handle empty connection list', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [],
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = { Authorization: 'Bearer test-token' }
      const connections = await listConnections(headers)

      expect(connections).toEqual([])
    })
  })

  describe('listResources', () => {
    it('should successfully list root resources', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [
            {
              id: '1',
              resource_id: '1GYpHUOiSYXGz_9GeUGgQkwQUJqCAxibGd9szwMJQSIg',
              name: 'Important notes.txt',
              inode_type: 'file',
              inode_path: { path: 'Important notes.txt' },
              mimeType: 'text/plain',
              size: 1024,
              indexedStatus: 'not_indexed',
            },
            {
              id: '2',
              resource_id: '1GrHAPg2LVnx78y7diTMC_6AVQV1sehk2',
              name: 'Documents',
              inode_type: 'directory',
              inode_path: { path: 'Documents' },
              indexedStatus: 'indexed',
            },
          ],
          nextPageToken: 'next-token-123',
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = { Authorization: 'Bearer test-token' }
      const result = await listResources('conn-123', null, {}, headers)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.stack-ai.com/connections/conn-123/resources/children',
        { headers },
      )

      expect(result.data).toHaveLength(2)
      expect(result.data[0].inode_path.path).toBe('Important notes.txt')
      expect(result.data[1].inode_type).toBe('directory')
      expect(result.nextPageToken).toBe('next-token-123')
    })

    it('should include resource_id parameter for folder contents', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ data: [] }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = { Authorization: 'Bearer test-token' }
      await listResources('conn-123', 'folder-456', {}, headers)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.stack-ai.com/connections/conn-123/resources/children?resource_id=folder-456',
        { headers },
      )
    })

    it('should include search and sort parameters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ data: [] }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = { Authorization: 'Bearer test-token' }
      const params = {
        q: 'search term',
        sort: 'name' as const,
        order: 'desc' as const,
        pageToken: 'page-token',
      }

      await listResources('conn-123', null, params, headers)

      const expectedUrl =
        'https://api.stack-ai.com/connections/conn-123/resources/children?q=search+term&sort=name&order=desc&pageToken=page-token'
      expect(fetch).toHaveBeenCalledWith(expectedUrl, { headers })
    })

    it('should map indexed_status to indexedStatus', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [
            {
              id: '1',
              resource_id: 'test-id',
              name: 'test.txt',
              inode_type: 'file',
              inode_path: { path: 'test.txt' },
              indexed_status: 'indexed',
            },
          ],
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = { Authorization: 'Bearer test-token' }
      const result = await listResources('conn-123', null, {}, headers)

      expect(result.data[0].indexedStatus).toBe('indexed')
    })
  })

  describe('getOrCreateKnowledgeBase', () => {
    it('should successfully create a knowledge base when none exists', async () => {
      // mock list response
      const mockListResponse = createMockResponse({
        ok: true,
        json: async () => [],
      })

      // mock create response
      const mockCreateResponse = createMockResponse({
        ok: true,
        json: async () => ({
          knowledge_base_id: 'kb_12345',
          name: 'File Picker KB 1234567890',
          description: 'Knowledge base created from file picker',
          connection_id: 'conn-123',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }),
      })

      vi.mocked(fetch)
        .mockResolvedValueOnce(mockListResponse)
        .mockResolvedValueOnce(mockCreateResponse)

      const headers = { Authorization: 'Bearer test-token' }
      const kb = await getOrCreateKnowledgeBase('conn-123', headers)

      // should check for existing KBs firstt
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.stack-ai.com/knowledge_bases?connection_id=conn-123&limit=1',
        { headers },
      )

      // then create new KB
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.stack-ai.com/knowledge_bases',
        expect.objectContaining({
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('File Picker KB'),
        }),
      )

      expect(kb.knowledge_base_id).toBe('kb_12345')
    })

    it('should reuse existing knowledge base', async () => {
      const existingKb = {
        knowledge_base_id: 'kb_existing',
        name: 'Existing KB',
        description: 'Already exists',
        connection_id: 'conn-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockListResponse = createMockResponse({
        ok: true,
        json: async () => [existingKb],
      })

      vi.mocked(fetch).mockResolvedValueOnce(mockListResponse)

      const headers = { Authorization: 'Bearer test-token' }
      const kb = await getOrCreateKnowledgeBase('conn-123', headers)

      expect(kb).toEqual(existingKb)
      // should only call list endpoint, not create
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.stack-ai.com/knowledge_bases?connection_id=conn-123&limit=1',
        { headers },
      )
    })
  })

  describe('startIndex', () => {
    it('should successfully start indexing', async () => {
      // mock list KB response (no existing KBs)
      const mockListKbResponse = createMockResponse({
        ok: true,
        json: async () => [],
      })

      // Mock knowledge base creation
      const mockKbResponse = createMockResponse({
        ok: true,
        json: async () => ({
          knowledge_base_id: 'kb_12345',
          name: 'Test KB',
          connection_id: 'conn-123',
        }),
      })

      // Mock org ID response
      const mockOrgResponse = createMockResponse({
        ok: true,
        json: async () => ({
          org_id: 'org_12345',
        }),
      })

      // mock sync trigger response
      const mockSyncResponse = createMockResponse({
        ok: true,
        json: async () => ({
          status: 'sync_started',
          message: 'Knowledge base sync has been triggered',
        }),
      })

      vi.mocked(fetch)
        .mockResolvedValueOnce(mockListKbResponse)
        .mockResolvedValueOnce(mockKbResponse)
        .mockResolvedValueOnce(mockOrgResponse)
        .mockResolvedValueOnce(mockSyncResponse)

      const headers = { Authorization: 'Bearer test-token' }
      const result = await startIndex(
        'conn-123',
        'resource-456',
        false,
        false,
        headers,
      )

      expect(result.jobId).toBe('sync-kb_12345')
      expect(result.status).toBe('started')
    })
  })

  describe('deindexResource', () => {
    it('should successfully deindex a resource', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'deleted',
          message: 'Resource removed successfully',
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = { Authorization: 'Bearer test-token' }
      const result = await deindexResource(
        'kb_12345',
        'path/to/file.txt',
        headers,
      )

      expect(fetch).toHaveBeenCalledWith(
        'https://api.stack-ai.com/knowledge_bases/kb_12345/resources?resource_path=path%2Fto%2Ffile.txt',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resource_path: 'path/to/file.txt' }),
        }),
      )

      expect(result.status).toBe('deindexed')
    })
  })

  describe('checkJobStatus', () => {
    it('should return completed status for demo purposes', async () => {
      const result = await checkJobStatus('job-123', {})

      expect(result.jobId).toBe('job-123')
      expect(result.status).toBe('completed')
      expect(result.progress).toBe(100)
      expect(result.completedAt).toBeDefined()
    })
  })

  describe('fetchFileContent', () => {
    it('should successfully fetch text file content', async () => {
      const mockResponse = {
        ok: true,
        text: async () => 'Hello, world!',
        headers: {
          get: vi.fn().mockReturnValue('text/plain'),
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce(
        mockResponse as unknown as Response,
      )

      const headers = { Authorization: 'Bearer test-token' }
      const result = await fetchFileContent('conn-123', 'resource-456', headers)

      expect(result.content).toBe('Hello, world!')
      expect(result.mimeType).toBe('text/plain')
    })

    it('should convert PDF to base64', async () => {
      const mockArrayBuffer = new ArrayBuffer(8)
      const mockResponse = {
        ok: true,
        arrayBuffer: async () => mockArrayBuffer,
        headers: {
          get: vi.fn().mockReturnValue('application/pdf'),
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce(
        mockResponse as unknown as Response,
      )

      const headers = { Authorization: 'Bearer test-token' }
      const result = await fetchFileContent('conn-123', 'resource-456', headers)

      expect(result.content).toMatch(/^data:application\/pdf;base64,/)
      expect(result.mimeType).toBe('application/pdf')
    })

    it('should try multiple endpoints and throw on failure', async () => {
      const mockResponse = createMockResponse({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      // mock all three endpoint attempts to fail
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse)

      const headers = { Authorization: 'Bearer test-token' }

      await expect(
        fetchFileContent('conn-123', 'resource-456', headers),
      ).rejects.toThrow('HTTP 404: Not Found')

      expect(fetch).toHaveBeenCalledTimes(3)
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const headers = { Authorization: 'Bearer test-token' }

      await expect(
        fetchFileContent('conn-123', 'resource-456', headers),
      ).rejects.toThrow('Network error')
    })
  })

  describe('getDefaultAuthHeaders', () => {
    const originalEnv = process.env

    afterEach(() => {
      process.env = originalEnv
    })

    it('should use environment variables for authentication', async () => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_STACKAI_EMAIL: 'test@example.com',
        NEXT_PUBLIC_STACKAI_PASSWORD: 'password123',
      }

      const mockResponse = {
        ok: true,
        json: async () => ({
          access_token: 'env-test-token',
        }),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response)

      const headers = await getDefaultAuthHeaders()

      expect(headers).toEqual({
        Authorization: 'Bearer env-test-token',
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('test@example.com'),
        }),
      )
    })

    it('should throw error when environment variables are missing', async () => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_STACKAI_EMAIL: undefined,
        NEXT_PUBLIC_STACKAI_PASSWORD: undefined,
      }

      await expect(getDefaultAuthHeaders()).rejects.toThrow(
        'Missing authentication credentials',
      )
    })

    it('should throw error when only email is provided', async () => {
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_STACKAI_EMAIL: 'test@example.com',
        NEXT_PUBLIC_STACKAI_PASSWORD: undefined,
      }

      await expect(getDefaultAuthHeaders()).rejects.toThrow(
        'Missing authentication credentials',
      )
    })
  })

  describe('Error handling', () => {
    it('should handle malformed JSON responses', async () => {
      // cleear cache to ensure fresh API call
      clearCaches()

      const mockResponse = createMockResponse({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

      const headers = { Authorization: 'Bearer test-token' }

      await expect(listConnections(headers)).rejects.toThrow('Invalid JSON')
    })

    it('should handle network timeouts', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Request timeout'))

      const headers = { Authorization: 'Bearer test-token' }

      await expect(getOrgId(headers)).rejects.toThrow('Request timeout')
    })
  })

  describe('URL construction', () => {
    it('should properly encode query parameters', async () => {
      const mockResponse = createMockResponse({
        ok: true,
        json: async () => ({ data: [] }),
      })

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

      const headers = { Authorization: 'Bearer test-token' }
      const params = {
        q: 'search with spaces & special chars!',
        sort: 'name' as const,
      }

      await listResources('conn-123', null, params, headers)

      const expectedUrl =
        'https://api.stack-ai.com/connections/conn-123/resources/children?q=search+with+spaces+%26+special+chars%21&sort=name'
      expect(fetch).toHaveBeenCalledWith(expectedUrl, { headers })
    })
  })
})
