import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { IndexedStatus } from '@/lib/types'

interface StatusPillProps {
  status: IndexedStatus
  className?: string
}

/**
 * status pill component for displaying indexing status
 * shows colored badges for indexed, indexing, and not_indexed states
 */
export function StatusPill({ status, className }: StatusPillProps) {
  const getStatusConfig = (status: IndexedStatus) => {
    switch (status) {
      case 'indexed':
        return {
          label: 'Indexed',
          variant: 'default' as const,
          className:
            'bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200',
        }
      case 'indexing':
        return {
          label: 'Indexing',
          variant: 'secondary' as const,
          className:
            'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200',
        }
      case 'deindexing':
        return {
          label: 'Deindexing',
          variant: 'secondary' as const,
          className:
            'bg-orange-100 text-orange-800 hover:bg-orange-100/80 border-orange-200',
        }
      case 'not_indexed':
        return {
          label: 'Not Indexed',
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-600 hover:bg-gray-50/80',
        }
      default:
        return {
          label: 'Unknown',
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-600',
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {(status === 'indexing' || status === 'deindexing') && (
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      )}
      {config.label}
    </Badge>
  )
}
