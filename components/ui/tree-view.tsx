import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import * as React from 'react'

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
  expandAll?: boolean
  folderIcon?: LucideIcon
  itemIcon?: LucideIcon
} & VariantProps<typeof treeVariants>

const useTree = ({
  initialSelectedItemId,
  onSelectChange,
}: {
  initialSelectedItemId?: string
  onSelectChange?: (item: TreeDataItem | undefined) => void
}) => {
  const [selectedItemId, setSelectedItemId] = React.useState<
    string | undefined
  >(initialSelectedItemId)

  const handleSelectChange = React.useCallback(
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

const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      data,
      initialSelectedItemId,
      onSelectChange,
      expandAll,
      folderIcon,
      itemIcon,
      className,
      ...props
    },
    ref,
  ) => {
    const { selectedItemId, handleSelectChange } = useTree({
      initialSelectedItemId,
      onSelectChange,
    })

    const getAllItemIds = React.useCallback(
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

    const expandedItemIds = React.useMemo(() => {
      if (!initialSelectedItemId) {
        return [] as string[]
      }

      const ids: string[] = []

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
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      className,
      data,
      selectedItemId,
      handleSelectChange,
      expandedItemIds,
      FolderIcon,
      ItemIcon,
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
}

const TreeNode = ({
  item,
  selectedItemId,
  expandedItemIds,
  handleSelectChange,
  FolderIcon,
  ItemIcon,
}: TreeNodeProps) => {
  const hasChildren = item.children && item.children.length > 0
  const isSelected = selectedItemId === item.id

  const Icon = item.icon || (hasChildren ? FolderIcon : ItemIcon)

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
          'flex cursor-pointer items-center py-2 px-2 before:right-1 group hover:before:opacity-100 before:absolute before:left-0 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10 w-full text-left',
          isSelected &&
            'before:opacity-100 before:bg-accent/70 text-accent-foreground',
        )}
        onClick={() => {
          handleSelectChange(item)
          item.onClick?.()
        }}
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

      {/* Always render children if they exist - no accordion/folding */}
      {hasChildren && (
        <ul className="ml-2.5 border-l border-muted pl-2 h-full">
          {item.children?.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              selectedItemId={selectedItemId}
              expandedItemIds={expandedItemIds}
              handleSelectChange={handleSelectChange}
              FolderIcon={FolderIcon}
              ItemIcon={ItemIcon}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

const AccordionTrigger = React.forwardRef<
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

const AccordionContent = React.forwardRef<
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
