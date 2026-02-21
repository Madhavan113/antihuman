import type { CSSProperties, ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
  className?: string
  children?: ReactNode
}

const tabBase: CSSProperties = {
  padding: '8px 16px',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.01em',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  borderBottom: '2px solid transparent',
  color: 'var(--text-muted)',
  transition: 'color 150ms ease-out, border-color 150ms ease-out',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
}

export function Tabs({ tabs, activeId, onChange, className = '' }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-0 ${className}`}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {tabs.map(tab => {
        const active = tab.id === activeId
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            style={{
              ...tabBase,
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottomColor: active ? 'var(--accent)' : 'transparent',
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                fontSize: 11,
                color: active ? 'var(--accent)' : 'var(--text-dim)',
                fontWeight: 400,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
