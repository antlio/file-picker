import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface NavigationState {
  currentFolderPath: string
  currentFolderId: string | null
  isNavigatingToFolder: boolean
  pathToIdMap: Map<string, string>
}

interface NavigationActions {
  setCurrentFolder: (path: string, id: string | null) => void
  setNavigating: (isNavigating: boolean) => void
  addPathMapping: (path: string, id: string) => void
  clearPathMapping: () => void
  updatePathMapping: (
    items: Array<{
      inode_type: string
      inode_path?: { path: string }
      resource_id: string
    }>,
  ) => void
}

type NavigationStore = NavigationState & NavigationActions

/**
 * zustand navigation store
 */
export const useNavigationStore = create<NavigationStore>()(
  subscribeWithSelector((set, get) => ({
    currentFolderPath: '/',
    currentFolderId: null,
    isNavigatingToFolder: false,
    pathToIdMap: new Map<string, string>(),

    setCurrentFolder: (path: string, id: string | null) => {
      set({
        currentFolderPath: path,
        currentFolderId: id,
        isNavigatingToFolder: true,
      })
    },

    setNavigating: (isNavigating: boolean) => {
      set({ isNavigatingToFolder: isNavigating })
    },

    addPathMapping: (path: string, id: string) => {
      const currentMap = get().pathToIdMap
      const newMap = new Map(currentMap)
      newMap.set(path, id)
      set({ pathToIdMap: newMap })
    },

    clearPathMapping: () => {
      set({ pathToIdMap: new Map() })
    },

    updatePathMapping: (items) => {
      if (items.length === 0) return

      const currentMap = get().pathToIdMap
      const newMap = new Map(currentMap)

      items.forEach((item) => {
        if (item.inode_type === 'directory' && item.inode_path?.path) {
          newMap.set(`/${item.inode_path.path}`, item.resource_id)
        }
      })
      set({ pathToIdMap: newMap })
    },
  })),
)
