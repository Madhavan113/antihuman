import { useState } from 'react'
import type { PerpetualPosition } from '../../api/derivatives'
import { StatusBadge } from '../ui/Badge'
import { PnLCell } from './PnLCell'

interface PositionRowProps {
  position: PerpetualPosition
  marketQuestion?: string
  agentName?: string
}

export function PositionRow({ position, marketQuestion, agentName }: PositionRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div
        className="grid px-4 py-2 transition-colors duration-150"
        style={{
          gridTemplateColumns: '1fr 80px 80px 90px 90px 90px 60px 90px',
          cursor: 'pointer',
          background: expanded ? 'var(--bg-raised)' : 'transparent',
        }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)' }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div className="flex flex-col">
          <span
            style={{
              fontSize: 13,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 260,
            }}
            title={marketQuestion}
          >
            {marketQuestion ?? position.marketId}
          </span>
          <div className="flex items-center gap-2" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            <span>{position.outcome}</span>
            {agentName && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span>{agentName}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <StatusBadge status={position.side} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-primary)', alignSelf: 'center' }}>
          {position.sizeHbar.toFixed(1)}
        </span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {(position.entryPrice * 100).toFixed(1)}%
        </span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {(position.markPrice * 100).toFixed(1)}%
        </span>
        <div style={{ alignSelf: 'center' }}>
          <PnLCell value={position.unrealizedPnlHbar} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
          {position.leverage}x
        </span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-dim)', alignSelf: 'center' }}>
          {(position.liquidationPrice * 100).toFixed(1)}%
        </span>
      </div>

      {expanded && (
        <div
          className="px-4 pb-3 pt-1 grid grid-cols-2 gap-x-8 gap-y-2"
          style={{ background: 'var(--bg-raised)', fontSize: 12 }}
        >
          <Detail label="Status"><StatusBadge status={position.status} /></Detail>
          <Detail label="Margin Mode">{position.marginMode}</Detail>
          <Detail label="Margin">{position.marginHbar.toFixed(2)} HBAR</Detail>
          <Detail label="Funding Accrued">{position.fundingAccruedHbar.toFixed(4)} HBAR</Detail>
          <Detail label="Opened">{new Date(position.openedAt).toLocaleString()}</Detail>
          {position.closedAt && <Detail label="Closed">{new Date(position.closedAt).toLocaleString()}</Detail>}
          {position.realizedPnlHbar !== undefined && (
            <Detail label="Realized P&L"><PnLCell value={position.realizedPnlHbar} /></Detail>
          )}
          <Detail label="Account">{agentName ?? position.accountId}</Detail>
          <div className="col-span-2" style={{ marginTop: 4 }}>
            <span className="label" style={{ fontSize: 10 }}>Position ID</span>
            <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-dim)', wordBreak: 'break-all' }}>
              {position.id}
            </span>
          </div>
        </div>
      )}
    </div>
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
