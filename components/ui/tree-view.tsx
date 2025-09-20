import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePrefetchFolder } from '@/hooks/useFolderListing'

import { cn } from '@/lib/utils'

const treeVariants = cva(
  'group hover:before:opacity-100 before:absolute before:left-0 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10',
)

interface TreeDataItem {
  id: string
  name: string
  icon?: LucideIcon
  selectedIcon?: LucideIcon
  openIcon?: LucideIcon
  children?: TreeDataItem[]
  actions?: React.ReactNode
  onClick?: () => void
}

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem[] | TreeDataItem
  initialSelectedItemId?: string
  onSelectChange?: (item: TreeDataItem | undefined) => void
  onNavigate?: (folderPath: string, folderId: string | null) => void
  onPrefetch?: (folderId: string) => void
  expandAll?: boolean
  folderIcon?: LucideIcon
  itemIcon?: LucideIcon
  connectionId?: string | null
  searchParams?: Record<string, string | undefined>
} & VariantProps<typeof treeVariants>

const useTree = ({
  initialSelectedItemId,
  onSelectChange,
}: {
  initialSelectedItemId?: string
  onSelectChange?: (item: TreeDataItem | undefined) => void
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(
    initialSelectedItemId,
  )

  // selected item when initialSelectedItemId changes
  useEffect(() => {
    setSelectedItemId(initialSelectedItemId)
  }, [initialSelectedItemId])

  const handleSelectChange = useCallback(
    (item: TreeDataItem | undefined) => {
      setSelectedItemId(item?.id)
      if (onSelectChange) {
        onSelectChange(item)
      }
    },
    [onSelectChange],
  )

  return {
    selectedItemId,
    handleSelectChange,
  }
}

const Tree = forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      data,
      initialSelectedItemId,
      onSelectChange,
      onNavigate,
      onPrefetch,
      expandAll,
      folderIcon,
      itemIcon,
      connectionId,
      searchParams,
      className,
      ...props
    },
    ref,
  ) => {
    const { selectedItemId, handleSelectChange } = useTree({
      initialSelectedItemId,
      onSelectChange,
    })

    const getAllItemIds = useCallback(
      (items: TreeDataItem[] | TreeDataItem): string[] => {
        const ids: string[] = []

        if (Array.isArray(items)) {
          items.forEach((item) => {
            ids.push(item.id)
            if (item.children?.length) {
              ids.push(...getAllItemIds(item.children))
            }
          })
        } else {
          ids.push(items.id)
          if (items.children?.length) {
            ids.push(...getAllItemIds(items.children))
          }
        }

        return ids
      },
      [],
    )

    const expandedItemIds = useMemo(() => {
      const ids: string[] = []

      // expand root node to show its children
      ids.push('root')

      if (!initialSelectedItemId) {
        return ids
      }

      function walkTreeItems(
        items: TreeDataItem[] | TreeDataItem,
        targetId: string,
      ) {
        if (Array.isArray(items)) {
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item) {
              ids.push(item.id)
              if (walkTreeItems(item, targetId) && !expandAll) {
                return true
              }
            }
            if (!expandAll) ids.pop()
          }
        } else if (!expandAll && items.id === targetId) {
          return true
        } else if (items.children) {
          return walkTreeItems(items.children, targetId)
        }
      }

      walkTreeItems(data, initialSelectedItemId)
      return expandAll ? getAllItemIds(data) : ids
    }, [data, expandAll, initialSelectedItemId, getAllItemIds])

    return (
      <div
        className={cn(
          'relative px-5 pt-4 h-[calc(100%-89px)] text-sm',
          className,
        )}
      >
        <TreeItem
          data={data}
          ref={ref}
          selectedItemId={selectedItemId}
          handleSelectChange={handleSelectChange}
          expandedItemIds={expandedItemIds}
          FolderIcon={folderIcon}
          ItemIcon={itemIcon}
          onNavigate={onNavigate}
          onPrefetch={onPrefetch}
          connectionId={connectionId}
          searchParams={searchParams}
          {...props}
        />
      </div>
    )
  },
)

Tree.displayName = 'Tree'

type TreeItemProps = TreeProps & {
  selectedItemId?: string
  handleSelectChange: (item: TreeDataItem | undefined) => void
  expandedItemIds: string[]
  FolderIcon?: LucideIcon
  ItemIcon?: LucideIcon
  onNavigate?: (folderPath: string, folderId: string | null) => void
  onPrefetch?: (folderId: string) => void
  connectionId?: string | null
  searchParams?: Record<string, string | undefined>
}

const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      className,
      data,
      selectedItemId,
      handleSelectChange,
      expandedItemIds,
      FolderIcon,
      ItemIcon,
      onNavigate,
      onPrefetch,
      connectionId,
      searchParams,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} role="tree" className={`h-full ${className}`} {...props}>
        <ul className="h-full">
          {Array.isArray(data) ? (
            data.map((item) => (
              <TreeNode
                key={item.id}
                item={item}
                selectedItemId={selectedItemId}
                expandedItemIds={expandedItemIds}
                handleSelectChange={handleSelectChange}
                FolderIcon={FolderIcon}
                ItemIcon={ItemIcon}
                onNavigate={onNavigate}
                onPrefetch={onPrefetch}
                connectionId={connectionId}
                searchParams={searchParams}
              />
            ))
          ) : (
            <TreeNode
              item={data}
              selectedItemId={selectedItemId}
              expandedItemIds={expandedItemIds}
              handleSelectChange={handleSelectChange}
              FolderIcon={FolderIcon}
              ItemIcon={ItemIcon}
              onNavigate={onNavigate}
              onPrefetch={onPrefetch}
              connectionId={connectionId}
              searchParams={searchParams}
            />
          )}
        </ul>
      </div>
    )
  },
)

TreeItem.displayName = 'TreeItem'

interface TreeNodeProps {
  item: TreeDataItem
  selectedItemId?: string
  expandedItemIds: string[]
  handleSelectChange: (item: TreeDataItem | undefined) => void
  FolderIcon?: LucideIcon
  ItemIcon?: LucideIcon
  onNavigate?: (folderPath: string, folderId: string | null) => void
  onPrefetch?: (folderId: string) => void
  connectionId?: string | null
  searchParams?: Record<string, string | undefined>
}

const TreeNode = ({
  item,
  selectedItemId,
  expandedItemIds,
  handleSelectChange,
  FolderIcon,
  ItemIcon,
  onNavigate,
  onPrefetch,
  connectionId,
  searchParams,
}: TreeNodeProps) => {
  const hasChildren = item.children && item.children.length > 0
  const isSelected = selectedItemId === item.id
  const isExpanded = expandedItemIds.includes(item.id)

  const Icon = item.icon || (hasChildren ? FolderIcon : ItemIcon)

  // Use SWR prefetch for better caching integration
  const { prefetch: swrPrefetch } = usePrefetchFolder()
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle hover prefetching using SWR
  const handleMouseEnter = useCallback(() => {
    // Prefetch any folder that's not root using SWR
    if (connectionId && item.id !== 'root') {
      // Clear any existing timeout
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }
      // Set new timeout for SWR prefetch
      prefetchTimeoutRef.current = setTimeout(async () => {
        try {
          await swrPrefetch(connectionId, item.id, searchParams || {})
          // Also call the legacy onPrefetch if provided for backward compatibility
          onPrefetch?.(item.id)
        } catch (error) {
          console.warn('SWR prefetch failed for folder:', item.id, error)
        }
        prefetchTimeoutRef.current = null
      }, 150)
    }
  }, [swrPrefetch, connectionId, item.id, searchParams, onPrefetch])

  const handleMouseLeave = useCallback(() => {
    // Clear any pending prefetch
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
      prefetchTimeoutRef.current = null
    }
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <li
      key={item.id}
      className={`
        relative
        ${item.id !== 'root' ? "before:content-[''] before:absolute before:block before:w-3 before:rounded-[0_5px] before:-left-[9px] before:h-5 before:border-l before:border-b before:border-border" : ''}
      `}
    >
      <button
        type="button"
        className={cn(
          'flex cursor-pointer items-center px-2 py-1.5 before:right-1 group hover:before:opacity-100 before:absolute before:left-0 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10 w-full text-left rounded-sm',
          isSelected && 'before:opacity-100 font-medium bg-primary/5',
        )}
        onClick={() => {
          handleSelectChange(item)

          // Always try onNavigate first for better navigation handling
          if (onNavigate) {
            // Handle special case for root
            const folderPath =
              item.id === 'root'
                ? '/'
                : item.name.startsWith('/')
                  ? item.name
                  : `/${item.name}`
            onNavigate(folderPath, item.id === 'root' ? null : item.id)
          } else {
            // Fallback to original onClick
            item.onClick?.()
          }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {Icon && (
          <Icon
            className="mr-2 h-4 w-4 shrink-0 text-accent-foreground/50"
            aria-hidden="true"
          />
        )}
        <span className="flex-grow truncate">{item.name}</span>
        {item.actions && <div className="ml-auto">{item.actions}</div>}
      </button>

      {/* render children only when expanded */}
      {hasChildren && isExpanded && (
        <ul className="ml-2.5 border-l border-muted pl-2 h-full space-y-1">
          {item.children?.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              selectedItemId={selectedItemId}
              expandedItemIds={expandedItemIds}
              handleSelectChange={handleSelectChange}
              FolderIcon={FolderIcon}
              ItemIcon={ItemIcon}
              onNavigate={onNavigate}
              onPrefetch={onPrefetch}
              connectionId={connectionId}
              searchParams={searchParams}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

const AccordionTrigger = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex w-full flex-1 items-center py-2 px-2 text-left text-xs font-medium hover:underline before:right-1 [&[data-state=open]>svg]:rotate-90',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn('overflow-hidden text-xs', className)}
    {...props}
  >
    <div className="pt-0 pb-2">{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Tree, type TreeDataItem }
