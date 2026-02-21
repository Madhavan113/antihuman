import { useMemo, useState } from 'react'
import type { Agent } from '../api/types'
import { AgentCard } from '../components/AgentCard'
import { AgentDrawerContent } from '../components/AgentDrawerContent'
import { Drawer } from '../components/Drawer'
import { PageHeader } from '../components/layout/PageHeader'
import { SkeletonCard } from '../components/Skeleton'
import { EmptyState } from '../components/ui'
import { useAgents } from '../hooks/useAgents'
import { useLeaderboard } from '../hooks/useReputation'

export function Agents() {
  const { data: agents = [], isLoading } = useAgents()
  const { data: leaderboard = [] } = useLeaderboard()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const sorted = useMemo(() => [...agents].sort((a, b) => b.reputationScore - a.reputationScore), [agents])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <PageHeader title="Agents" meta={`${agents.length} registered`} />

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto px-6 py-4" style={{ borderRight: '1px solid var(--border)' }}>
          {isLoading && (
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
            </div>
          )}
          {!isLoading && agents.length === 0 && (
            <EmptyState message="No agents registered" sub="Agents will appear here once the platform is running" />
          )}
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {sorted.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                rank={i + 1}
                onClick={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        </section>

        <aside className="overflow-y-auto" style={{ width: 260, flexShrink: 0 }}>
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1 }}
          >
            <p className="label">Reputation Leaderboard</p>
          </div>
          {leaderboard.length === 0 && (
            <EmptyState message="No attestations yet" />
          )}
          {leaderboard.map((entry, i) => (
            <div
              key={entry.accountId}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150"
              style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span className="label" style={{ fontSize: 10, color: 'var(--accent)', minWidth: 20 }}>#{i + 1}</span>
              <span className="font-mono flex-1 truncate" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {entry.accountId}
              </span>
              <span className="font-mono" style={{ fontSize: 12 }}>{entry.score.toFixed(1)}</span>
            </div>
          ))}
        </aside>
      </div>

      <Drawer open={Boolean(selectedAgent)} onClose={() => setSelectedAgent(null)}>
        {selectedAgent && <AgentDrawerContent agent={selectedAgent} />}
      </Drawer>
    </div>
  )
}
