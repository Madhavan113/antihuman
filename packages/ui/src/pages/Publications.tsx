import { useState } from 'react'
import { EngineControl } from '../components/EngineControl'
import { PipelineTheater } from '../components/PipelineTheater'
import { PublicationCard } from '../components/PublicationCard'
import { PublicationDetail } from '../components/PublicationDetail'
import { ResearchAgentCard } from '../components/ResearchAgentCard'
import { useReveal } from '../hooks/useReveal'
import {
  useResearchStatus,
  usePublications,
  usePublication,
  useResearchAgents,
  useResearchStart,
  useResearchStop,
  useResearchRunNow,
} from '../hooks/useResearch'

function RevealSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useReveal(0.08)
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(24px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function InlineStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
      <span className="label" style={{ fontSize: 9, color: 'var(--text-dim)' }}>
        {label}
      </span>
    </div>
  )
}

export function Publications() {
  const { data: status, error: statusError } = useResearchStatus()
  const { data: publications, isLoading: pubsLoading } = usePublications()
  const { data: agents } = useResearchAgents()
  const startMutation = useResearchStart()
  const stopMutation = useResearchStop()
  const runNowMutation = useResearchRunNow()

  const [selectedPubId, setSelectedPubId] = useState<string | null>(null)
  const { data: selectedPubData } = usePublication(selectedPubId ?? undefined)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filteredPubs = publications?.filter((p) =>
    !statusFilter || p.status === statusFilter
  ) ?? []

  if (statusError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-sm" style={{ color: '#e74c3c' }}>
          Failed to connect to the research engine.
        </p>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
          {statusError instanceof Error ? statusError.message : 'Check that the API server is running.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 p-6" style={{ maxWidth: 1200 }}>

      {/* ── Header: editorial title + compact controls ── */}
      <RevealSection>
        <div className="flex items-end justify-between gap-6 mb-2">
          <div>
            <h1
              className="editorial"
              style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300, letterSpacing: '-0.02em' }}
            >
              Research Lab
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', maxWidth: 480 }}>
              Autonomous agents observe market behavior, identify patterns, and produce
              rigorous publications with self-evaluation suites.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {status?.running && (
              <button
                onClick={() => runNowMutation.mutate()}
                disabled={runNowMutation.isPending}
                className="label text-xs px-3 py-1.5"
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  cursor: runNowMutation.isPending ? 'wait' : 'pointer',
                  opacity: runNowMutation.isPending ? 0.5 : 1,
                }}
              >
                Run Now
              </button>
            )}
            <EngineControl
              label={status?.running ? `Tick ${status.tickCount}` : 'Stopped'}
              running={status?.running ?? false}
              onStart={() => startMutation.mutate()}
              onStop={() => stopMutation.mutate()}
              isLoading={startMutation.isPending || stopMutation.isPending}
            />
          </div>
        </div>

        {/* Compact inline stats */}
        <div className="flex items-center gap-6 mt-3 mb-6">
          <InlineStat label="PUBLISHED" value={status?.publishedCount ?? 0} />
          <span style={{ color: 'var(--border)' }}>|</span>
          <InlineStat label="TOTAL" value={status?.totalPublications ?? 0} />
          <span style={{ color: 'var(--border)' }}>|</span>
          <InlineStat label="AVG SCORE" value={status?.averageEvalScore ?? '—'} />
          <span style={{ color: 'var(--border)' }}>|</span>
          <InlineStat label="OBSERVATIONS" value={status?.totalObservations ?? 0} />
        </div>
      </RevealSection>

      {status?.lastError && (
        <div
          className="px-4 py-2 text-xs mb-4"
          style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 8, color: '#e74c3c' }}
        >
          {status.lastError}
        </div>
      )}

      {/* ── Pipeline Theater ── */}
      <RevealSection delay={100}>
        <div className="mb-8">
          <h2 className="label text-xs mb-3" style={{ color: 'var(--text-dim)' }}>PIPELINE</h2>
          <PipelineTheater agents={agents ?? []} />
        </div>
      </RevealSection>

      {/* ── Agent Profiles ── */}
      <RevealSection delay={200}>
        <div className="mb-8">
          <h2 className="label text-xs mb-3" style={{ color: 'var(--text-dim)' }}>RESEARCHERS</h2>
          {agents && agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map((agent, i) => (
                <RevealSection key={agent.id} delay={250 + i * 80}>
                  <ResearchAgentCard agent={agent} />
                </RevealSection>
              ))}
            </div>
          ) : (
            <div
              className="flex items-center justify-center py-8"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
              }}
            >
              <p className="label text-xs" style={{ color: 'var(--text-dim)' }}>
                {status?.running ? 'Initializing research agents…' : 'Start the engine to deploy researchers.'}
              </p>
            </div>
          )}
        </div>
      </RevealSection>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 24px' }} />

      {/* ── Publications ── */}
      <RevealSection delay={350}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="label text-xs" style={{ color: 'var(--text-dim)' }}>PUBLICATIONS</h2>
            <div className="flex items-center gap-2">
              {['', 'PUBLISHED', 'RETRACTED', 'EVALUATING', 'DRAFTING'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="label text-xs px-2 py-1"
                  style={{
                    borderRadius: 4,
                    background: statusFilter === s ? 'var(--accent-dim)' : 'transparent',
                    border: statusFilter === s ? '1px solid var(--accent-dim)' : '1px solid transparent',
                    cursor: 'pointer',
                    color: statusFilter === s ? 'var(--text-primary)' : 'var(--text-dim)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {pubsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="skeleton-pulse"
                  style={{
                    height: 140,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                  }}
                />
              ))}
            </div>
          ) : filteredPubs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
              }}
            >
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                {status?.running
                  ? 'Researchers are collecting data. First publications will appear shortly.'
                  : 'Start the research engine to begin producing publications.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPubs.map((pub) => (
                <PublicationCard
                  key={pub.id}
                  publication={pub}
                  onClick={() => setSelectedPubId(pub.id)}
                />
              ))}
            </div>
          )}
        </div>
      </RevealSection>

      {/* Detail drawer */}
      {selectedPubData?.publication && (
        <PublicationDetail
          publication={selectedPubData.publication}
          onClose={() => setSelectedPubId(null)}
        />
      )}
    </div>
  )
}
