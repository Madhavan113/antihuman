interface OddsBarProps {
  outcomes: string[]
  counts: Record<string, number>
  height?: number
}

export function OddsBar({ outcomes, counts, height = 6 }: OddsBarProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  const primary = outcomes[0] ?? 'YES'
  const fillPct = ((counts[primary] ?? 0) / total) * 100

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height, background: 'var(--bg-raised)', borderRadius: 2 }}
    >
      <div
        className="absolute left-0 top-0 h-full"
        style={{ width: `${fillPct}%`, background: 'var(--accent-dim)', transition: 'width 300ms ease-out' }}
      />
    </div>
  )
}
