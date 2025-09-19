'use client'

import { File as FileIcon, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import FileCsv from '@/assets/FileCsv'
import FilePdf from '@/assets/FilePdf'
import FileTxt from '@/assets/FileTxt'
import Stack from '@/assets/Stack'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchFileContent, getDefaultAuthHeaders } from '@/lib/api'
import type { File } from '@/lib/types'
import { formatBytes } from '@/utils/format'

interface FileContentDrawerProps {
  file: File | null
  connectionId: string | null
  isOpen: boolean
  onClose: () => void
}

/**
 * file content drawer component
 */
export function FileContentDrawer({
  file,
  connectionId,
  isOpen,
  onClose,
}: FileContentDrawerProps) {
  const [fileContent, setFileContent] = useState<string>('')
  const [contentType, setContentType] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * load file content using Google Drive direct URL when available
   */
  const loadFileContent = useCallback(
    async (fileItem: File) => {
      setIsLoading(true)
      setError(null)

      try {
        // Use Google Drive web_url if available, but handle auth issues
        if (fileItem.dataloader_metadata?.web_url) {
          const driveUrl = fileItem.dataloader_metadata.web_url
          const fileId = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]

          if (fileId) {
            const mimeType = fileItem.content_mime || ''

            try {
              if (mimeType.includes('text/') || mimeType.includes('json')) {
                // Try to fetch text content directly
                const directUrl = `https://drive.google.com/uc?id=${fileId}&export=download`
                const response = await fetch(directUrl, {
                  mode: 'cors',
                  credentials: 'include',
                })

                if (response.ok) {
                  const textContent = await response.text()
                  setFileContent(textContent)
                  setContentType(mimeType)
                  return
                }
              } else if (mimeType.includes('application/pdf')) {
                // For PDFs, use embedded viewer that doesn't require auth
                const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
                setFileContent(embedUrl)
                setContentType(mimeType)
                return
              } else if (mimeType.includes('image/')) {
                // Try direct image URL, fallback to API if auth fails
                const directUrl = `https://drive.google.com/uc?id=${fileId}`

                // Test if the image is accessible
                const img = new Image()
                img.crossOrigin = 'anonymous'

                const imageLoadPromise = new Promise((resolve, reject) => {
                  img.onload = () => resolve(directUrl)
                  img.onerror = () => reject(new Error('Image not accessible'))
                })

                img.src = directUrl

                try {
                  await imageLoadPromise
                  setFileContent(directUrl)
                  setContentType(mimeType)
                  return
                } catch {
                  // Image not accessible, fallback to API
                }
              }
            } catch (error) {
              console.warn(
                'Google Drive direct access failed, falling back to API:',
                error,
              )
            }
          }
        }

        // Fallback to API if no web_url or direct access failed
        if (!connectionId) {
          setError(
            'File preview requires connection. Please ensure you are connected to Google Drive.',
          )
          return
        }

        try {
          const headers = await getDefaultAuthHeaders()
          const { content, mimeType } = await fetchFileContent(
            connectionId,
            fileItem.resource_id,
            headers,
          )

          setFileContent(content)
          setContentType(mimeType)
        } catch (apiError) {
          console.error('API fallback also failed:', apiError)

          // Show file info even if preview fails
          if (fileItem.dataloader_metadata?.web_url) {
            setError(
              'Preview unavailable. You can view this file directly in Google Drive.',
            )
            setFileContent(
              `Open in Google Drive: ${fileItem.dataloader_metadata.web_url}`,
            )
            setContentType('text/plain')
          } else {
            setError('File content preview unavailable')
          }
        }
      } catch (err) {
        console.error('Error loading file content:', err)
        setError('File content preview unavailable')
      } finally {
        setIsLoading(false)
      }
    },
    [connectionId],
  )

  // reset state when file changes
  useEffect(() => {
    if (file) {
      setFileContent('')
      setError(null)
      loadFileContent(file)
    }
  }, [file, loadFileContent])

  /**
   * get file icon based on file extension and mime type
   */
  const getFileIcon = () => {
    const mimeType = file?.content_mime?.toLowerCase() || ''

    switch (mimeType) {
      default:
        if (mimeType.includes('text/csv')) {
          return <FileCsv className="h-5 w-5" />
        }
        if (mimeType.includes('application/pdf')) {
          return <FilePdf className="h-5 w-5" />
        }
        if (mimeType.includes('text/plain')) {
          return <FileTxt className="h-5 w-5" />
        }

        // fallback to generic file icon
        return <FileIcon className="h-5 w-5" />
    }
  }

  /**
   * render file content based on content type and source
   */
  const renderFileContent = () => {
    if (!fileContent) return null

    const mimeType = contentType || file?.content_mime || ''

    // PDF files - handle both Google Drive URLs and base64 data
    if (mimeType.includes('application/pdf')) {
      if (fileContent.startsWith('https://drive.google.com/')) {
        return (
          <div className="w-full h-full min-h-full">
            <iframe
              src={fileContent}
              width="100%"
              height="100%"
              className="border rounded-md"
              title="PDF Preview"
            />
          </div>
        )
      } else if (fileContent.startsWith('data:application/pdf;base64,')) {
        return (
          <div className="w-full h-full">
            <embed
              src={fileContent}
              type="application/pdf"
              width="100%"
              height="100%"
              className="border rounded"
            />
          </div>
        )
      }
    }

    // Images - handle both Google Drive URLs and base64 data
    if (mimeType.includes('image/')) {
      return (
        <div className="text-center w-full">
          {/* biome-ignore lint/performance/noImgElement: Next.js Image doesn't support data URLs */}
          <img
            src={fileContent}
            alt={file?.inode_path.path || 'File preview'}
            className="max-w-full h-auto rounded border"
            style={{ maxHeight: '400px' }}
          />
        </div>
      )
    }

    // Text content (JSON, plain text, code, etc.)
    if (
      mimeType.includes('text/') ||
      mimeType.includes('json') ||
      mimeType.includes('javascript') ||
      mimeType.includes('code')
    ) {
      // Handle Google Drive link display
      if (fileContent.startsWith('Open in Google Drive:')) {
        const url = fileContent.replace('Open in Google Drive: ', '')
        return (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Preview unavailable. Open this file directly:
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Open in Google Drive
            </a>
          </div>
        )
      }

      return (
        <pre className="text-sm font-mono whitespace-pre-wrap text-foreground bg-muted/20 p-4 rounded border overflow-x-auto">
          {fileContent}
        </pre>
      )
    }

    // Default text rendering
    return (
      <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
        {fileContent}
      </pre>
    )
  }

  if (!file) return null

  return (
    <div
      className={`
      w-96 bg-background border-l border-border flex flex-col
      transition-width duration-150 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}
    >
      {/* header */}
      <div className="flex items-center justify-between px-3 py-1.75 h-12 border-b border-border">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getFileIcon()}
          <h3
            className="font-medium text-sm truncate"
            title={file.inode_path.path}
          >
            {file.inode_path.path}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* content */}
      <div className="border-b border-x -mx-px flex-1 rounded-b-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 mx-auto">
                <Stack className="w-full h-full" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-3">
            <div className="text-center space-y-2">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadFileContent(file)}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="h-full p-3">{renderFileContent()}</div>
          </ScrollArea>
        )}
      </div>

      {/* footer with file info */}
      <div className="border-border p-3 bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Type: {file.content_mime || 'Unknown'}</div>
          <div>Size: {(file.size && formatBytes(file.size)) || 'Unknown'}</div>
        </div>
      </div>
    </div>
  )
}
