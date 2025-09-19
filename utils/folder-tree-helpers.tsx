import { Home, type LucideProps } from 'lucide-react'
import { forwardRef } from 'react'
import FolderSvg from '@/assets/Folder'
import FolderOpenSvg from '@/assets/FolderOpen'
import type { TreeDataItem } from '@/components/ui/tree-view'
import type { File } from '@/lib/types'

// lucide-compatible wrapper components
export const Folder = forwardRef<SVGSVGElement, LucideProps>(
  ({ className }, _ref) => (
    <div className={`w-4 h-4 ${className}`}>
      <FolderSvg />
    </div>
  ),
)
Folder.displayName = 'Folder'

export const FolderOpen = forwardRef<SVGSVGElement, LucideProps>(
  ({ className }, _ref) => (
    <div className={`w-4 h-4 ${className}`}>
      <FolderOpenSvg />
    </div>
  ),
)
FolderOpen.displayName = 'FolderOpen'

/**
 * get folder path from file item
 * @param item
 * @returns
 */
export function getFolderPath(item: File): string {
  return item.inode_path?.path
    ? `/${item.inode_path.path}`
    : `/${item.resource_id}`
}

/**
 * get folder name from file item
 * @param item
 * @returns
 */
export function getFolderName(item: File): string {
  return item.inode_path?.path || item.resource_id
}

/**
 * create tree item from file
 * @param folder
 * @param onFolderSelect
 * @returns
 */
export function createTreeItem(
  folder: File,
  onFolderSelect: (folderPath: string) => void,
): TreeDataItem {
  const folderPath = getFolderPath(folder)
  return {
    id: folderPath,
    name: getFolderName(folder),
    icon: Folder,
    onClick: () => onFolderSelect(folderPath),
  }
}

/**
 * build tree data for folders with optional children
 * @param folderDataCache
 * @param currentFolderId
 * @param currentFolderPath
 * @param onFolderSelect
 * @param showChildren
 * @returns
 */
export function buildFolderTreeData(
  folderDataCache: Map<string | null, File[]>,
  currentFolderId: string | null,
  currentFolderPath: string,
  onFolderSelect: (folderPath: string) => void,
  showChildren: boolean = true,
): TreeDataItem[] {
  const rootItems = folderDataCache.get(null) || []
  const rootFolders = rootItems.filter(
    (item) => item.inode_type === 'directory',
  )

  return rootFolders.map((folder) => {
    const folderPath = getFolderPath(folder)
    const isCurrentFolder = folderPath === currentFolderPath
    const treeItem = createTreeItem(folder, onFolderSelect)

    // add children if this is the current folder and we want to show children
    if (
      showChildren &&
      isCurrentFolder &&
      folderDataCache.has(currentFolderId)
    ) {
      const currentFolderItems = folderDataCache.get(currentFolderId) || []
      const subfolders = currentFolderItems.filter(
        (item) => item.inode_type === 'directory',
      )

      if (subfolders.length > 0) {
        treeItem.children = subfolders.map((subfolder) =>
          createTreeItem(subfolder, onFolderSelect),
        )
      }
    }

    return treeItem
  })
}

/**
 * create complete tree with root node
 * @param folderTreeData
 * @param onFolderSelect
 * @param includeHomeIcon
 * @returns
 */
export function createCompleteTree(
  folderTreeData: TreeDataItem[],
  onFolderSelect: (folderPath: string) => void,
  includeHomeIcon: boolean = true,
): TreeDataItem[] {
  return [
    {
      id: 'root',
      name: 'Root',
      icon: includeHomeIcon ? Home : undefined,
      onClick: () => onFolderSelect('/'),
      children: folderTreeData,
    },
  ]
}
