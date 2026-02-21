import { Stat } from '../ui/Stat'
import { EmptyState } from '../ui/EmptyState'
import { useDerivativesOverview } from '../../hooks/useDerivatives'

export function MarginPanel() {
  const { data: overview } = useDerivativesOverview()

  if (!overview) {
    return (
      <div className="p-4">
        <span className="label" style={{ display: 'block', marginBottom: 12 }}>Margin</span>
        <EmptyState message="Loading..." />
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      <span className="label" style={{ display: 'block' }}>Overview</span>

      <Stat label="Open Interest" value={`${overview.totalOpenInterestHbar.toFixed(1)} HBAR`} />
      <Stat label="Positions" value={overview.totalPositions} />
      <Stat label="Options" value={overview.totalOptions} />
      <Stat label="Margin Locked" value={`${overview.totalMarginLockedHbar.toFixed(1)} HBAR`} />
      <Stat label="Insurance Fund" value={`${overview.insuranceFundHbar.toFixed(1)} HBAR`} />

      {overview.recentLiquidations.length > 0 && (
        <>
          <span className="label" style={{ display: 'block', marginTop: 8 }}>Recent Liquidations</span>
          <div className="flex flex-col gap-1">
            {overview.recentLiquidations.slice(0, 5).map((liq, i) => {
              const l = liq as Record<string, unknown>
              return (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    padding: '4px 8px',
                    background: 'var(--bg-raised)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--danger)',
                    fontFamily: 'monospace',
                  }}
                >
                  {String(l.accountId ?? '?')} — {String(l.sizeHbar ?? '?')} HBAR
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
