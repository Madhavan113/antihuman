import type { ClawdbotGoal, ClawdbotProfile } from '../api/types'
import { Badge, StatusBadge } from './ui/Badge'

export function BotCard({ bot, goal }: { bot: ClawdbotProfile; goal?: ClawdbotGoal }) {
  return (
    <div
      className="flex flex-col gap-2 p-4"
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-primary">{bot.name}</span>
        <Badge variant={bot.origin === 'community' ? 'active' : 'default'}>
          {bot.origin}
        </Badge>
      </div>
      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bot.accountId}</span>
      <div className="flex items-center gap-2">
        <Badge variant="default">{bot.strategy}</Badge>
        <Badge variant="default">{bot.mode}</Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="label" style={{ fontSize: 10 }}>
          Bankroll: <span style={{ color: 'var(--text-primary)' }}>{bot.bankrollHbar} HBAR</span>
        </span>
        <span className="label" style={{ fontSize: 10 }}>
          Rep: <span style={{ color: 'var(--text-primary)' }}>{bot.reputationScore.toFixed(1)}</span>
        </span>
      </div>
      {goal && (
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="label" style={{ fontSize: 10 }}>
            Goal: <span style={{ color: 'var(--text-primary)' }}>{goal.title}</span>
          </span>
          <StatusBadge status={goal.status} />
        </div>
      )}
    </div>
  )
}
