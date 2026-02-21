import type { OptionContract } from '../../api/derivatives'
import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/Badge'

interface OptionCardProps {
  option: OptionContract
}

export function OptionCard({ option }: OptionCardProps) {
  const isCall = option.optionType === 'CALL'

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={option.optionType} />
          <StatusBadge status={option.status} />
        </div>
        <span className="label" style={{ fontSize: 10 }}>{option.style}</span>
      </div>

      <div className="mb-3">
        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{option.outcome}</span>
        <span style={{ fontSize: 11, display: 'block', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
          {option.marketId}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="label" style={{ display: 'block', fontSize: 10, marginBottom: 2 }}>Strike</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: isCall ? 'var(--success)' : 'var(--danger)' }}>
            {(option.strikePrice * 100).toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="label" style={{ display: 'block', fontSize: 10, marginBottom: 2 }}>Premium</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
            {option.premiumHbar.toFixed(2)} HBAR
          </span>
        </div>
        <div>
          <span className="label" style={{ display: 'block', fontSize: 10, marginBottom: 2 }}>Size</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {option.sizeHbar.toFixed(1)} HBAR
          </span>
        </div>
        <div>
          <span className="label" style={{ display: 'block', fontSize: 10, marginBottom: 2 }}>Expires</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {new Date(option.expiresAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 8 }} className="flex justify-between">
        <div>
          <span className="label" style={{ fontSize: 9 }}>Writer</span>
          <span style={{ display: 'block', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-dim)' }}>
            {option.writerAccountId}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="label" style={{ fontSize: 9 }}>Holder</span>
          <span style={{ display: 'block', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-dim)' }}>
            {option.holderAccountId || '—'}
          </span>
        </div>
      </div>
    </Card>
  )
}
