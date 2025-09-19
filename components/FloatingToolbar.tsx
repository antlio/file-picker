'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FloatingToolbarProps {
  selectedCount: number
  onIndex: () => void
  onDeindex: () => void
  onClearSelection: () => void
}

/**
 * floating toolbar component with framer motion animation
 * appears from bottom when items are selected for bulk actions
 */
export function FloatingToolbar({
  selectedCount,
  onIndex,
  onDeindex,
  onClearSelection,
}: FloatingToolbarProps) {
  const isVisible = selectedCount > 0

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0, filter: 'blur(15px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: 50, opacity: 0, filter: 'blur(2px)' }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-background border border-border rounded-full shadow-lg pl-5 pr-1.5 py-1 flex items-center space-x-4 min-w-fit">
            {/* count */}
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">
                {selectedCount} file{selectedCount === 1 ? '' : 's'} selected
              </span>
            </div>

            {/* buttons */}
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="outline" onClick={onDeindex}>
                Deindex
              </Button>
              <Button size="sm" variant="default" onClick={onIndex}>
                Index
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearSelection}
                className="h-8 w-8 p-0 rounded-sm rounded-r-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
