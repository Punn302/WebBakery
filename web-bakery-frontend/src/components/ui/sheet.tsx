import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: 'right' | 'left'
}

export function Sheet({ open, onOpenChange, children, side = 'right' }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const slideVariants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={slideVariants[side].initial}
              animate={slideVariants[side].animate}
              exit={slideVariants[side].exit}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-screen max-w-md bg-white border-l border-[#e7e5e4] shadow-2xl flex flex-col h-full"
            >
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function SheetHeader({
  className,
  onClose,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-5 border-b border-[#e7e5e4] bg-[#faf8f5]',
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-none hover:bg-black/5 text-[#78716c] hover:text-[#1c1917] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export function SheetContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto p-5', className)} {...props} />
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-5 border-t border-[#e7e5e4] bg-[#faf8f5] flex flex-col gap-3', className)}
      {...props}
    />
  )
}
