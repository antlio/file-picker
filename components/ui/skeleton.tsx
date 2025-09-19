import { cn } from '@/lib/utils'

/**
 * skeleton primitive component for loading states
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-sm', className)}
      {...props}
    />
  )
}

export { Skeleton }
