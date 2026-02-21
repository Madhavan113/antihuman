interface StatProps {
  label: string
  value: string | number
  sub?: string
  className?: string
}

export function Stat({ label, value, sub, className = '' }: StatProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
      }}
    >
      <span className="label" style={{ display: 'block', marginBottom: 4 }}>{label}</span>
      <span style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        {value}
      </span>
      {sub && (
        <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</span>
      )}
    </div>
  )
}
