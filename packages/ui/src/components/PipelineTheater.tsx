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

export function PipelineTheater({ agents }: { agents: ResearchAgentProfile[] }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '24px 0 20px',
        overflow: 'hidden',
      }}
    >
      {/* Stage columns */}
      <div style={{ display: 'flex', position: 'relative', minHeight: 100 }}>
        {STAGES.map((stage, si) => {
          const agentsHere = agents.filter((a) => agentStageIndex(a) === si)
          const isTerminal = stage.key === 'PUBLISHED'
          const isIdle = stage.key === 'IDLE'

          return (
            <div
              key={stage.key}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                position: 'relative',
              }}
            >
              {/* Vertical guide line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: agentsHere.length > 0 ? 'var(--accent-dim)' : 'var(--border)',
                  opacity: isIdle ? 0.3 : 0.6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 0,
                }}
              />

              {/* Stage label */}
              <span
                className="label"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  color: agentsHere.length > 0 ? 'var(--text-primary)' : 'var(--text-dim)',
                  position: 'relative',
                  zIndex: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {stage.label}
              </span>

              {/* Agent dots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
                {agentsHere.map((agent) => {
                  const hue = agentHue(agent)
                  const isActive = !!agent.currentStage && !isIdle && !isTerminal

                  return (
                    <div
                      key={agent.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {/* Dot */}
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: isIdle
                            ? 'var(--text-dim)'
                            : isTerminal
                              ? 'var(--accent)'
                              : `hsl(${hue}, 55%, 55%)`,
                          boxShadow: isActive
                            ? `0 0 12px hsl(${hue}, 55%, 55%, 0.4)`
                            : 'none',
                          animation: isActive ? 'accent-pulse 2s ease-in-out infinite' : 'none',
                          border: `2px solid ${isIdle ? 'var(--border)' : `hsl(${hue}, 40%, 35%)`}`,
                        }}
                      />
                      {/* Label */}
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 500,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: isIdle ? 'var(--text-dim)' : `hsl(${hue}, 45%, 65%)`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {agentShortName(agent)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Horizontal connector line */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '6.25%',
            right: '6.25%',
            height: 1,
            background: 'linear-gradient(90deg, var(--border) 0%, var(--accent-dim) 50%, var(--accent) 100%)',
            opacity: 0.4,
          }}
        />
      </div>

      {/* Legend */}
      {agents.length === 0 && (
        <p
          className="label"
          style={{
            textAlign: 'center',
            fontSize: 10,
            color: 'var(--text-dim)',
            marginTop: 8,
          }}
        >
          No active research agents
        </p>
      )}
    </div>
  )
}
