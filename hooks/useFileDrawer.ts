import { useCallback, useState } from 'react'
import type { File } from '@/lib/types'

/**
 * hook for managing file content drawer state
 * @returns drawer state and control functions
 */
export function useFileDrawer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  /**
   * handle file click to open content drawer
   * @param file
   */
  const handleFileClick = useCallback((file: File) => {
    setSelectedFile(file)
    setIsDrawerOpen(true)
  }, [])

  /**
   * handle closing the file content drawer
   */
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    // smooth close animation
    setTimeout(() => setSelectedFile(null), 150)
  }, [])

  return {
    selectedFile,
    isDrawerOpen,
    handleFileClick,
    handleCloseDrawer,
  }
}
