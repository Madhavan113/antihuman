import type { FundingRate } from '../../api/derivatives'

interface FundingRateBarProps {
  rates: FundingRate[]
}

export function FundingRateBar({ rates }: FundingRateBarProps) {
  if (rates.length === 0) return null

  const latest = rates[0]
  const pct = (latest.rate * 100).toFixed(4)
  const positive = latest.rate >= 0

  return (
    <div className="flex items-center gap-1.5">
      <span className="label" style={{ fontSize: 10 }}>Funding</span>
      <span style={{
        fontSize: 11,
        fontFamily: 'monospace',
        fontWeight: 500,
        color: positive ? 'var(--danger)' : 'var(--success)',
      }}>
        {positive ? '+' : ''}{pct}%
      </span>
    </div>
  )
}
