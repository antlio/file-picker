import { nanoid } from 'nanoid'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * skeleton row component for loading states
 */
export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between space-x-4 px-3 py-4.75">
      {/* checkbox/icon */}
      <Skeleton className="h-4 w-4" />

      {/* bame */}
      <Skeleton className="h-4 flex-1 w-80" />

      <div className="flex items-center space-x-4">
        {/* size */}
        <Skeleton className="h-4 w-16" />

        {/* status */}
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

/**
 * multiple skeleton rows for loading lists
 */
export function SkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <div className="bg-white first:rounded-t-lg last:rounded-b-lg border">
      {Array.from({ length: count }).map((_) => (
        <SkeletonRow key={nanoid()} />
      ))}
    </div>
  )
}
