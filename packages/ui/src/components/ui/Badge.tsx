import type { CSSProperties, ReactNode } from 'react'

type BadgeVariant = 'default' | 'open' | 'resolved' | 'disputed' | 'closed'
  | 'long' | 'short' | 'active' | 'success' | 'danger' | 'warning'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  default:  { borderColor: 'var(--border)', color: 'var(--text-muted)' },
  open:     { borderColor: 'var(--accent-dim)', color: 'var(--accent)' },
  resolved: { borderColor: 'var(--status-resolved-border)', color: 'var(--status-resolved-text)' },
  disputed: { borderColor: 'var(--status-disputed-border)', color: 'var(--status-disputed-text)' },
  closed:   { borderColor: 'var(--border)', color: 'var(--text-dim)' },
  long:     { borderColor: '#3A4A3A', color: '#6B8F6B' },
  short:    { borderColor: '#4A2A2A', color: '#C45A5A' },
  active:   { borderColor: 'var(--accent-dim)', color: 'var(--accent)' },
  success:  { borderColor: '#3A4A3A', color: 'var(--success)' },
  danger:   { borderColor: '#4A2A2A', color: 'var(--danger)' },
  warning:  { borderColor: '#4A3A2A', color: 'var(--warning)' },
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      style={{
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        border: '1px solid',
        background: 'var(--bg-raised)',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  )
}

const statusMap: Record<string, BadgeVariant> = {
  OPEN: 'open', RESOLVED: 'resolved', DISPUTED: 'disputed', CLOSED: 'closed',
  LONG: 'long', SHORT: 'short', ACTIVE: 'active',
  CALL: 'long', PUT: 'short',
  PENDING: 'warning', IN_PROGRESS: 'active', COMPLETED: 'success',
  CANCELLED: 'closed', EXPIRED: 'closed', LIQUIDATED: 'danger',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={statusMap[status] ?? 'default'} className={className}>
      {status}
    </Badge>
  )
}
