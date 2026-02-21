import type { Market } from '../api/types'
import { computeImpliedOdds } from '../utils/odds'
import { OddsBar } from './OddsBar'
import { StatusBadge } from './ui/Badge'

interface MarketCardProps {
  market: Market
  volumeNorm?: number
  onClick?: () => void
  horizontal?: boolean
  stakeByOutcome?: Record<string, number>
}

export function MarketCard({ market, onClick, horizontal = false, stakeByOutcome }: MarketCardProps) {
  const resolvesAt = new Date(market.closeTime)
  const msUntilResolution = resolvesAt.getTime() - Date.now()
  const resolutionLabel =
    market.status === 'RESOLVED'
      ? 'resolved'
      : msUntilResolution <= 0
        ? 'resolution pending'
        : msUntilResolution < 60 * 60 * 1000
          ? `resolves in ${Math.max(1, Math.round(msUntilResolution / (60 * 1000)))}m`
          : `resolves in ${Math.max(1, Math.round(msUntilResolution / (60 * 60 * 1000)))}h`
  const odds = computeImpliedOdds({
    outcomes: market.outcomes,
    initialOddsByOutcome: market.initialOddsByOutcome,
    stakeByOutcome,
    resolvedOutcome: market.resolvedOutcome,
  })

  if (horizontal) {
    return (
      <button
        onClick={onClick}
        aria-label={`Market: ${market.question}`}
        className="w-full flex items-center gap-4 px-4 py-2.5 text-left transition-colors duration-150"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'transparent',
          cursor: 'pointer',
          border: 'none',
          borderBlockEnd: '1px solid var(--border)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <span className="flex-1 text-sm text-primary truncate" style={{ fontWeight: 400 }}>{market.question}</span>
        <StatusBadge status={market.status} />
        <div className="w-24 shrink-0">
          <OddsBar outcomes={market.outcomes} counts={odds} height={6} />
        </div>
        <span className="font-mono text-xs shrink-0" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
          {market.creatorAccountId.slice(0, 10)}...
        </span>
        <span className="label shrink-0" style={{ fontSize: 10 }}>
          {resolutionLabel}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      aria-label={`Market: ${market.question}`}
      className="flex overflow-hidden text-left transition-colors duration-150"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        width: '100%',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-dim)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
    >
      <div className="flex flex-col gap-2.5 p-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-primary leading-snug" style={{ fontWeight: 400 }}>{market.question}</p>
          <StatusBadge status={market.status} />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            {market.outcomes.map((o: string) => (
              <span key={o} className="label" style={{ fontSize: 10 }}>{o}</span>
            ))}
          </div>
          <OddsBar outcomes={market.outcomes} counts={odds} height={6} />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {market.creatorAccountId}
          </span>
          <span className="label" style={{ fontSize: 10 }}>
            {resolutionLabel}
          </span>
        </div>
      </div>
    </button>
  )
}
