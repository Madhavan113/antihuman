import { useState } from 'react'
import type { OptionContract } from '../../api/derivatives'
import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/Badge'

interface OptionCardProps {
  option: OptionContract
  marketQuestion?: string
  agentNames?: Record<string, string>
}

export function OptionCard({ option, marketQuestion, agentNames }: OptionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isCall = option.optionType === 'CALL'
  const writerName = agentNames?.[option.writerAccountId]
  const holderName = option.holderAccountId ? agentNames?.[option.holderAccountId] : undefined

  return (
    <Card>
      <div
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={option.optionType} />
            <StatusBadge status={option.status} />
          </div>
          <span className="label" style={{ fontSize: 10 }}>{option.style}</span>
        </div>

        <div className="mb-3">
          <span
            style={{
              fontSize: 13,
              color: 'var(--text-primary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
            title={marketQuestion}
          >
            {marketQuestion ?? option.marketId}
          </span>
          <span style={{ fontSize: 11, display: 'block', color: 'var(--text-dim)', marginTop: 2 }}>
            {option.outcome} · {isCall ? 'Pays if probability exceeds strike' : 'Pays if probability stays below strike'}
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
            <span style={{ display: 'block', fontSize: 12, color: writerName ? 'var(--text-muted)' : 'var(--text-dim)', fontFamily: writerName ? 'inherit' : 'monospace' }}>
              {writerName ?? option.writerAccountId}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="label" style={{ fontSize: 9 }}>Holder</span>
            <span style={{ display: 'block', fontSize: 12, color: holderName ? 'var(--text-muted)' : 'var(--text-dim)', fontFamily: holderName ? 'inherit' : 'monospace' }}>
              {holderName ?? (option.holderAccountId || '—')}
            </span>
          </div>
        </div>
      </div>

      {expanded && (
        <div
          style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, fontSize: 12 }}
          className="grid grid-cols-2 gap-x-6 gap-y-2"
        >
          <Detail label="Collateral">{option.collateralHbar.toFixed(2)} HBAR</Detail>
          <Detail label="Created">{new Date(option.createdAt).toLocaleString()}</Detail>
          {option.exercisedAt && <Detail label="Exercised">{new Date(option.exercisedAt).toLocaleString()}</Detail>}
          {option.settlementHbar !== undefined && <Detail label="Settlement">{option.settlementHbar.toFixed(2)} HBAR</Detail>}
          <div className="col-span-2">
            <span className="label" style={{ fontSize: 10 }}>Writer Account</span>
            <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-dim)' }}>
              {option.writerAccountId}
            </span>
          </div>
          {option.holderAccountId && (
            <div className="col-span-2">
              <span className="label" style={{ fontSize: 10 }}>Holder Account</span>
              <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-dim)' }}>
                {option.holderAccountId}
              </span>
            </div>
          )}
          <div className="col-span-2" style={{ marginTop: 2 }}>
            <span className="label" style={{ fontSize: 10 }}>Option ID</span>
            <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-dim)', wordBreak: 'break-all' }}>
              {option.id}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label" style={{ fontSize: 10, display: 'block', marginBottom: 1 }}>{label}</span>
      <span style={{ color: 'var(--text-muted)' }}>{children}</span>
    </div>
  )
}
