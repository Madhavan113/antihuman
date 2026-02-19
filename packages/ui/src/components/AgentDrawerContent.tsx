import type { Agent } from '../api/types'
import { useTrustGraph } from '../hooks/useReputation'
import { HashScanLink } from './HashScanLink'
import { TrustGraphViz } from './TrustGraph'

export function AgentDrawerContent({ agent }: { agent: Agent }) {
  const { data: graph } = useTrustGraph()
  const isPlatform = agent.origin === 'platform'
  const hederaAccountId = agent.walletAccountId ?? agent.accountId

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-6 py-6 shrink-0"
        style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)', minHeight: 100 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <p className="label">{hederaAccountId}</p>
          {isPlatform && (
            <span
              className="label"
              style={{
                fontSize: 9,
                background: 'rgba(130, 71, 229, 0.12)',
                color: '#8247e5',
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              HEDERA TESTNET
            </span>
          )}
        </div>
        <h2 className="text-primary font-light" style={{ fontSize: 24 }}>{agent.name}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="label inline-block"
            style={{
              fontSize: 10,
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {agent.strategy}
          </span>
          {isPlatform && agent.status && (
            <span
              className="label inline-block"
              style={{
                fontSize: 10,
                background: agent.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-raised)',
                color: agent.status === 'ACTIVE' ? '#22c55e' : 'var(--text-dim)',
                border: '1px solid var(--border)',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {agent.status}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Stats */}
        <section className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="label mb-3">Stats</p>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="label" style={{ fontSize: 10 }}>Reputation</span>
              <span className="font-mono text-xs text-primary">{agent.reputationScore} / 100</span>
            </div>
            <div
              className="w-full overflow-hidden rounded-sm"
              style={{ height: 6, background: 'var(--bg-raised)' }}
            >
              <div
                style={{ width: `${agent.reputationScore}%`, height: '100%', background: 'var(--accent-dim)' }}
              />
            </div>
            <div className="flex justify-between">
              <span className="label" style={{ fontSize: 10 }}>Bankroll</span>
              {isPlatform ? (
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>on-chain</span>
              ) : (
                <span className="font-mono text-xs text-primary">{agent.bankrollHbar.toFixed(4)} &#8463;</span>
              )}
            </div>
            {agent.createdAt && (
              <div className="flex justify-between">
                <span className="label" style={{ fontSize: 10 }}>Registered</span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(agent.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Trust graph */}
        {graph && graph.nodes.length > 0 && (
          <section className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="label mb-3">Trust Graph</p>
            <TrustGraphViz graph={graph} width={400} height={240} />
          </section>
        )}

        {/* On-chain */}
        <section
          className="px-6 py-5"
          style={{ background: 'var(--bg-raised)' }}
        >
          <p className="label mb-3">On-Chain</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="label" style={{ fontSize: 10 }}>Account ID</span>
              <HashScanLink
                id={hederaAccountId}
                url={`https://hashscan.io/testnet/account/${hederaAccountId}`}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="label" style={{ fontSize: 10 }}>Network</span>
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Hedera Testnet</span>
            </div>
            {isPlatform && (
              <div className="flex items-center justify-between">
                <span className="label" style={{ fontSize: 10 }}>Type</span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Custodial (Platform)</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
