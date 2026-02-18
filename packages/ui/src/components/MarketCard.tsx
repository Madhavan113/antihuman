import type { Market } from '../api/types'
import { DitherPanel } from './dither/DitherPanel'
import { OddsBar } from './OddsBar'

interface MarketCardProps {
  market: Market
  /** 0–1 normalized volume for dither encoding */
  volumeNorm: number
  onClick?: () => void
  horizontal?: boolean
}

export function MarketCard({ market, volumeNorm, onClick, horizontal = false }: MarketCardProps) {
  const closesAt = new Date(market.closeTime)
  const isExpired = closesAt < new Date()
  const fakeCount = market.outcomes.reduce<Record<string, number>>((acc, o, i) => {
    acc[o] = i === 0 ? 60 : 40
    return acc
  }, {})

  if (horizontal) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-raised border-b transition-colors"
        style={{ borderColor: 'var(--border)', background: 'transparent', cursor: 'pointer' }}
      >
        <span className="flex-1 text-sm font-medium text-primary truncate">{market.question}</span>
        <span className="status-badge shrink-0" data-status={market.status}>{market.status}</span>
        <div className="w-24 shrink-0">
          <OddsBar outcomes={market.outcomes} counts={fakeCount} height={6} />
        </div>
        <span className="font-mono text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
          {market.creatorAccountId.slice(0, 10)}…
        </span>
        <span className="label shrink-0" style={{ fontSize: 10 }}>
          {isExpired ? 'CLOSED' : closesAt.toLocaleDateString()}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="flex overflow-hidden text-left transition-colors"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {/* Main content */}
      <div className="flex flex-col gap-3 p-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-primary leading-snug">{market.question}</p>
          <span className="status-badge shrink-0" data-status={market.status}>{market.status}</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            {market.outcomes.map(o => (
              <span key={o} className="label" style={{ fontSize: 10 }}>{o}</span>
            ))}
          </div>
          <OddsBar outcomes={market.outcomes} counts={fakeCount} height={8} />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            {market.creatorAccountId}
          </span>
          <span className="label" style={{ fontSize: 10 }}>
            {isExpired ? 'expired' : `closes ${closesAt.toLocaleDateString()}`}
          </span>
        </div>
      </div>

      {/* Dither strip — right edge, encodes volume */}
      <div className="shrink-0 scanline-zone" style={{ width: 100 }}>
        <DitherPanel value={volumeNorm} width={100} height="100%" />
      </div>
    </button>
  )
}
