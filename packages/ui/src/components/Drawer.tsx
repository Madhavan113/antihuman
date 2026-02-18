import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MacroblockReveal } from './dither/MacroblockReveal'

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: number
}

export function Drawer({ open, onClose, children, width = 480 }: DrawerProps) {
  const [revealing, setRevealing] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const prevOpen = useRef(false)

  useEffect(() => {
    if (open && !prevOpen.current) {
      setRevealing(true)
      setContentVisible(false)
    }
    if (!open) {
      setContentVisible(false)
    }
    prevOpen.current = open
  }, [open])

  // Close on Escape — only when drawer is open
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open && !revealing) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 h-screen z-50 flex flex-col border-l"
        style={{
          width,
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          transform: open ? 'translateX(0)' : `translateX(${width}px)`,
          transition: 'transform 0.25s linear',
        }}
      >
        {/* Macroblock reveal canvas — covers the drawer on open */}
        <MacroblockReveal
          active={revealing}
          onDone={() => {
            setRevealing(false)
            setContentVisible(true)
          }}
        />

        {/* Content — visible after reveal completes */}
        <div
          className="flex flex-col h-full overflow-y-auto"
          style={{ opacity: contentVisible ? 1 : 0, transition: 'opacity 0.1s linear' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 label"
            style={{ fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
            aria-label="Close drawer"
          >
            ESC
          </button>
          {children}
        </div>
      </div>
    </>
  )
}
