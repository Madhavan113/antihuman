import type { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, className = '', style, onClick, hoverable }: CardProps) {
  return (
    <div
      className={`${hoverable ? 'card-hover' : ''} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 16,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'background 150ms ease-out, border-color 150ms ease-out',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  meta?: ReactNode
  className?: string
}

export function CardHeader({ title, meta, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</h3>
      {meta}
    </div>
  )
}
