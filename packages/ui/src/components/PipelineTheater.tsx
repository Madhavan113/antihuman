import type { ResearchAgentProfile, PublicationStatus } from '@simulacrum/types'
import { RESEARCH_FOCUS_SHORT_LABELS } from '@simulacrum/types'

const STAGES: { key: PublicationStatus | 'IDLE'; label: string }[] = [
  { key: 'IDLE',          label: 'IDLE' },
  { key: 'COLLECTING',    label: 'COLLECT' },
  { key: 'ANALYZING',     label: 'ANALYZE' },
  { key: 'HYPOTHESIZING', label: 'HYPOTHESIZE' },
  { key: 'DRAFTING',      label: 'DRAFT' },
  { key: 'REVIEWING',     label: 'REVIEW' },
  { key: 'EVALUATING',    label: 'EVALUATE' },
  { key: 'PUBLISHED',     label: 'PUBLISH' },
]

const FOCUS_HUES: Record<string, number> = {
  agential_game_theory: 30,
  reputation_systems: 45,
  agent_coordination: 170,
  market_microstructure: 210,
  oracle_reliability: 0,
  agent_native_economics: 270,
}

function agentStageIndex(agent: ResearchAgentProfile): number {
  if (!agent.currentStage) return 0
  const idx = STAGES.findIndex((s) => s.key === agent.currentStage)
  return idx >= 0 ? idx : 0
}

function agentHue(agent: ResearchAgentProfile): number {
  return FOCUS_HUES[agent.focusArea] ?? 30
}

function agentShortName(agent: ResearchAgentProfile): string {
  return RESEARCH_FOCUS_SHORT_LABELS[agent.focusArea] ?? agent.focusArea.slice(0, 5)
}

function AgentDot({ agent }: { agent: ResearchAgentProfile }) {
  const stageIdx = agentStageIndex(agent)
  const hue = agentHue(agent)
  const isIdle = stageIdx === 0
  const isTerminal = STAGES[stageIdx]?.key === 'PUBLISHED'
  const isActive = !isIdle && !isTerminal
  const pct = (stageIdx / (STAGES.length - 1)) * 100

  return (
    <div
      style={{
        position: 'absolute',
        left: `${pct}%`,
        top: 0,
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        transition: 'left 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: isIdle
            ? 'var(--text-dim)'
            : isTerminal
              ? 'var(--accent)'
              : `hsl(${hue}, 55%, 55%)`,
          boxShadow: isActive
            ? `0 0 16px hsl(${hue}, 55%, 55%, 0.5), 0 0 4px hsl(${hue}, 55%, 55%, 0.3)`
            : isTerminal
              ? '0 0 12px rgba(212,145,122,0.4)'
              : 'none',
          animation: isActive ? 'accent-pulse 2s ease-in-out infinite' : 'none',
          border: `2px solid ${isIdle ? 'var(--border)' : `hsl(${hue}, 40%, 35%)`}`,
          transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        }}
      />
      <span
        style={{
          fontSize: 8,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: isIdle ? 'var(--text-dim)' : `hsl(${hue}, 45%, 65%)`,
          whiteSpace: 'nowrap',
          transition: 'color 0.4s ease',
        }}
      >
        {agentShortName(agent)}
      </span>
    </div>
  )
}

export function PipelineTheater({ agents }: { agents: ResearchAgentProfile[] }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 32px 16px',
        overflow: 'hidden',
      }}
    >
      {/* Stage labels */}
      <div style={{ display: 'flex', position: 'relative' }}>
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            style={{
              flex: 1,
              textAlign: 'center',
            }}
          >
            <span
              className="label"
              style={{
                fontSize: 8,
                letterSpacing: '0.14em',
                color: 'var(--text-dim)',
              }}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      {/* Track */}
      <div style={{ position: 'relative', height: 56, marginTop: 8 }}>
        {/* Rail line */}
        <div
          style={{
            position: 'absolute',
            top: 7,
            left: '6.25%',
            right: '6.25%',
            height: 2,
            background: 'var(--border)',
            borderRadius: 1,
          }}
        />

        {/* Progress glow — extends to the furthest active agent */}
        {agents.length > 0 && (() => {
          const maxIdx = Math.max(...agents.map(agentStageIndex))
          if (maxIdx <= 0) return null
          const pct = (maxIdx / (STAGES.length - 1)) * 100
          return (
            <div
              style={{
                position: 'absolute',
                top: 7,
                left: '6.25%',
                width: `${pct - 6.25}%`,
                height: 2,
                background: 'linear-gradient(90deg, var(--accent-dim), var(--accent))',
                borderRadius: 1,
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 8px rgba(212,145,122,0.3)',
              }}
            />
          )
        })()}

        {/* Stage tick marks */}
        {STAGES.map((_, i) => {
          const pct = (i / (STAGES.length - 1)) * 100
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                top: 4,
                width: 1,
                height: 8,
                background: 'var(--border)',
                transform: 'translateX(-50%)',
                zIndex: 1,
              }}
            />
          )
        })}

        {/* Agent dots */}
        {agents.map((agent) => (
          <AgentDot key={agent.id} agent={agent} />
        ))}
      </div>

      {agents.length === 0 && (
        <p className="label" style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-dim)' }}>
          No active research agents
        </p>
      )}
    </div>
  )
}
