import type { ResearchAgentProfile } from '@simulacrum/types'
import { RESEARCH_FOCUS_LABELS } from '@simulacrum/types'
import { PatternBadge } from './PatternBadge'

const FOCUS_INDEX: Record<string, number> = {
  agential_game_theory: 0,
  reputation_systems: 1,
  agent_coordination: 2,
  market_microstructure: 3,
  oracle_reliability: 4,
  agent_native_economics: 5,
}

const FOCUS_HUES: Record<string, number> = {
  agential_game_theory: 30,
  reputation_systems: 45,
  agent_coordination: 170,
  market_microstructure: 210,
  oracle_reliability: 0,
  agent_native_economics: 270,
}

export function ResearchAgentCard({ agent }: { agent: ResearchAgentProfile }) {
  const idx = FOCUS_INDEX[agent.focusArea] ?? 0
  const hue = FOCUS_HUES[agent.focusArea] ?? 30
  const isActive = !!agent.currentStage

  return (
    <div
      className="flex flex-col gap-4 p-5"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${isActive ? `hsl(${hue}, 30%, 25%)` : 'var(--border)'}`,
        borderRadius: 14,
        transition: 'border-color 0.6s ease, box-shadow 0.6s ease',
        boxShadow: isActive ? `0 0 20px hsl(${hue}, 40%, 20%, 0.3), inset 0 1px 0 hsl(${hue}, 30%, 25%, 0.2)` : 'none',
      }}
    >
      {/* Top row: badge + identity */}
      <div className="flex items-start gap-4">
        <PatternBadge idx={idx} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">{agent.name}</p>
          <p
            className="label mt-0.5"
            style={{ fontSize: 10, color: `hsl(${hue}, 45%, 60%)` }}
          >
            {RESEARCH_FOCUS_LABELS[agent.focusArea] ?? agent.focusArea}
          </p>
        </div>
        {/* Activity indicator */}
        {isActive && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: `hsl(${hue}, 55%, 55%)`,
                animation: 'accent-pulse 2s ease-in-out infinite',
              }}
            />
            <span className="label" style={{ fontSize: 9, color: 'var(--accent)' }}>
              {agent.currentStage}
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {agent.publicationCount}
          </span>
          <span className="label" style={{ fontSize: 8, color: 'var(--text-dim)' }}>
            PUBLICATIONS
          </span>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-base font-semibold" style={{ color: agent.averageEvalScore >= 60 ? 'var(--accent)' : 'var(--text-primary)' }}>
            {agent.averageEvalScore > 0 ? Math.round(agent.averageEvalScore) : '—'}
          </span>
          <span className="label" style={{ fontSize: 8, color: 'var(--text-dim)' }}>
            AVG SCORE
          </span>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {agent.observationCount}
          </span>
          <span className="label" style={{ fontSize: 8, color: 'var(--text-dim)' }}>
            OBSERVATIONS
          </span>
        </div>
      </div>
    </div>
  )
}
