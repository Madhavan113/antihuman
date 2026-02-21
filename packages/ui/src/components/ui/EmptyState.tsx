interface EmptyStateProps {
  message: string
  sub?: string
  className?: string
}

export function EmptyState({ message, sub, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', marginBottom: sub ? 4 : 0 }}>
        {message}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{sub}</p>
      )}
    </div>
  )
}
