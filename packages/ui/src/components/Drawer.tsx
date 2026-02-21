import { useEffect, type ReactNode } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: number
}

export function Drawer({ open, onClose, children, width = 480 }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)', animation: 'drawer-backdrop-in 200ms ease-out' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detail panel"
        className="fixed right-0 top-0 h-screen z-50 flex flex-col"
        style={{
          width,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          animation: 'drawer-panel-in 250ms ease-out',
        }}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10"
            style={{
              fontSize: 11,
              fontWeight: 500,
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 8px',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              letterSpacing: '0.04em',
              transition: 'color 150ms ease-out, border-color 150ms ease-out',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border)' }}
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
