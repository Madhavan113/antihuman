interface PageHeaderProps {
  title: string
  meta?: string
}

export function PageHeader({ title, meta }: PageHeaderProps) {
  return (
    <header style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="px-8 pt-8 pb-5">
        {meta && <p className="label mb-1.5">{meta}</p>}
        <h1 style={{
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
        }}>
          {title}
        </h1>
      </div>
    </header>
  )
}
