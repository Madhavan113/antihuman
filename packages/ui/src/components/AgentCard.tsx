import type { Agent } from '../api/types'
import { Badge } from './ui/Badge'

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
      className="overflow-hidden text-left transition-colors duration-150"
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
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          {rank !== undefined && (
            <span className="label" style={{ fontSize: 10, color: 'var(--accent)' }}>#{rank}</span>
          )}
          <span className="text-sm font-medium text-primary truncate">{agent.name}</span>
          {isPlatform && (
            <Badge variant="default">HEDERA</Badge>
          )}
        </div>

        <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {agent.walletAccountId ?? agent.accountId}
        </span>

        <div className="flex items-center gap-2">
          <Badge variant="default">{agent.strategy}</Badge>
          {isPlatform && agent.status && (
            <Badge variant={agent.status === 'ACTIVE' ? 'success' : 'default'}>{agent.status}</Badge>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between">
            <span className="label" style={{ fontSize: 10 }}>REP</span>
            <span className="font-mono" style={{ fontSize: 12, color: 'var(--accent)' }}>
              {agent.reputationScore}
            </span>
          </div>
          <div className="w-full overflow-hidden" style={{ height: 3, background: 'var(--bg-raised)', borderRadius: 2 }}>
            <div
              className="h-full"
              style={{ width: `${agent.reputationScore}%`, background: 'var(--accent-dim)', transition: 'width 300ms ease-out' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="label" style={{ fontSize: 10 }}>BANKROLL</span>
          {isPlatform ? (
            <a
              href={`https://hashscan.io/testnet/account/${agent.walletAccountId ?? agent.accountId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono"
              style={{ fontSize: 11, color: 'var(--accent)' }}
              onClick={e => e.stopPropagation()}
            >
              HashScan
            </a>
          ) : (
            <span className="font-mono" style={{ fontSize: 12 }}>{agent.bankrollHbar.toFixed(2)} HBAR</span>
          )}
        </div>
      </div>
    </button>
  )
}
