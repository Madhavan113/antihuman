import type { Agent } from '../api/types'

interface AgentCardProps {
  agent: Agent
  rank?: number
  onClick?: () => void
}

export function AgentCard({ agent, rank, onClick }: AgentCardProps) {
  const isPlatform = agent.origin === 'platform'

  return (
    <button
      onClick={onClick}
      aria-label={`Agent: ${agent.name}`}
      className="relative overflow-hidden text-left transition-colors"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <div className="flex flex-col gap-2 p-4">
        {/* Name row */}
        <div className="flex items-center gap-2">
          {rank !== undefined && (
            <span className="label" style={{ fontSize: 10, color: 'var(--accent)' }}>
              #{rank}
            </span>
          )}
          <span className="text-sm font-medium text-primary truncate">{agent.name}</span>
          {isPlatform && (
            <span
              className="label"
              style={{
                fontSize: 9,
                background: 'rgba(130, 71, 229, 0.12)',
                color: '#8247e5',
                padding: '1px 6px',
                borderRadius: 4,
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              HEDERA
            </span>
          )}
        </div>

        {/* Account ID */}
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {agent.walletAccountId ?? agent.accountId}
        </span>

        {/* Strategy + origin badges */}
        <div className="flex items-center gap-2">
          <span
            className="label"
            style={{
              fontSize: 10,
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              padding: '2px 6px',
              borderRadius: 4,
              display: 'inline-block',
              width: 'fit-content',
            }}
          >
            {agent.strategy}
          </span>
          {isPlatform && agent.status && (
            <span
              className="label"
              style={{
                fontSize: 10,
                background: agent.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-raised)',
                color: agent.status === 'ACTIVE' ? '#22c55e' : 'var(--text-dim)',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {agent.status}
            </span>
          )}
        </div>

        {/* Rep bar */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between">
            <span className="label" style={{ fontSize: 10 }}>REP</span>
            <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
              {agent.reputationScore}
            </span>
          </div>
          <div className="w-full rounded-sm overflow-hidden" style={{ height: 4, background: 'var(--bg-raised)' }}>
            <div
              className="h-full transition-[width]"
              style={{ width: `${agent.reputationScore}%`, background: 'var(--accent-dim)' }}
            />
          </div>
        </div>

        {/* Bankroll / On-chain link */}
        <div className="flex items-center justify-between mt-1">
          <span className="label" style={{ fontSize: 10 }}>BANKROLL</span>
          {isPlatform ? (
            <a
              href={`https://hashscan.io/testnet/account/${agent.walletAccountId ?? agent.accountId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs"
              style={{ color: 'var(--accent)' }}
              onClick={e => e.stopPropagation()}
            >
              view on HashScan
            </a>
          ) : (
            <span className="font-mono text-xs text-primary">{agent.bankrollHbar.toFixed(2)} &#8463;</span>
          )}
        </div>
      </div>
    </button>
  )
}
