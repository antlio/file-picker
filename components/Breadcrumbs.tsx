'use client'

import { ChevronRight } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'

interface BreadcrumbItem {
  path: string
  name: string
  isRoot?: boolean
}

interface BreadcrumbsProps {
  currentFolderPath: string
  onNavigate: (folderPath: string) => void
  className?: string
}

/**
 * breadcrumb navigation with folder path resolution
 */
export function Breadcrumbs({
  currentFolderPath,
  onNavigate,
  className = '',
}: BreadcrumbsProps) {
  // compute breadcrumbs directly from currentFolderPath using useMemo
  const breadcrumbs = useMemo(() => {
    try {
      const breadcrumbItems: BreadcrumbItem[] = [
        { path: '/', name: 'Root', isRoot: true },
      ]

      if (currentFolderPath !== '/') {
        const pathSegments = currentFolderPath
          .split('/')
          .filter((segment) => segment.length > 0)

        // e.g Root > Books > Summaries
        pathSegments.forEach((segment, index) => {
          const segmentPath = `/${pathSegments.slice(0, index + 1).join('/')}`
          breadcrumbItems.push({
            path: segmentPath,
            name: segment,
          })
        })
      }

      return breadcrumbItems
    } catch (_error) {
      // fallback
      return [
        { path: '/', name: 'Root', isRoot: true },
        ...(currentFolderPath !== '/'
          ? [{ path: currentFolderPath, name: currentFolderPath }]
          : []),
      ]
    }
  }, [currentFolderPath])

  /**
   * handle breadcrumb click navigation
   */
  const handleBreadcrumbClick = useCallback(
    (folderPath: string) => {
      onNavigate(folderPath)
    },
    [onNavigate],
  )

  return (
    <nav
      className={`flex items-center space-x-1 ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((item, index) => {
        const isDisabled = index === breadcrumbs.length - 1

        return (
          <div key={item.path} className="flex items-center space-x-1">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-0.75 py-1 font-medium hover:bg-transparent opacity-50 hover:opacity-100 disabled:opacity-100"
              onClick={() => handleBreadcrumbClick(item.path)}
              disabled={isDisabled}
            >
              {item.isRoot ? (
                <div className="flex items-center space-x-1">
                  <span>{item.name}</span>
                </div>
              ) : (
                <span className="max-w-[200px] truncate">{item.name}</span>
              )}
            </Button>
          </div>
        )
      })}
    </nav>
  )
}
