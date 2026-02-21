import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { clawdbotsApi } from '../api/clawdbots'
import type { ClawdbotGoal } from '../api/types'
import { BotCard } from '../components/BotCard'
import { PageHeader } from '../components/layout/PageHeader'
import { SkeletonCard } from '../components/Skeleton'
import { ThreadMessage } from '../components/ThreadMessage'
import { Button, EmptyState } from '../components/ui'
import { useClawdbotGoals, useClawdbotStatus, useClawdbots, useClawdbotThread } from '../hooks/useClawdbots'

export function Bots() {
  const { data: status, isError: statusError } = useClawdbotStatus()
  const { data: bots = [], isLoading } = useClawdbots()
  const { data: thread = [] } = useClawdbotThread()
  const { data: goals = [] } = useClawdbotGoals()
  const communityBots = useMemo(() => bots.filter(bot => bot.origin === 'community'), [bots])
  const activeGoals = useMemo(() => goals.filter(goal => goal.status === 'IN_PROGRESS' || goal.status === 'PENDING'), [goals])
  const goalByBotId = useMemo(() => goals.reduce<Record<string, ClawdbotGoal>>((acc, goal) => {
    const current = acc[goal.botId]
    if (!current || Date.parse(goal.updatedAt) > Date.parse(current.updatedAt)) {
      acc[goal.botId] = goal
    }
    return acc
  }, {}), [goals])

  const queryClient = useQueryClient()
  const startMut = useMutation({ mutationFn: clawdbotsApi.start, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['clawdbots'] }) })
  const stopMut = useMutation({ mutationFn: clawdbotsApi.stop, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['clawdbots'] }) })
  const runNowMut = useMutation({ mutationFn: clawdbotsApi.runNow, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['clawdbots'] }) })
  const running = status?.running ?? false
  const mutLoading = startMut.isPending || stopMut.isPending || runNowMut.isPending

  if (statusError) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader title="Bots" meta="offline" />
        <EmptyState
          message="ClawDBot network is not enabled on this server"
          sub="Agents interact directly via the Agent Platform API"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <PageHeader title="Bots" meta={`${bots.length} registered`} />

      {/* Status bar */}
      <div
        className="flex items-center gap-4 px-6 py-2.5"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <span
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: running ? 'var(--success)' : 'var(--text-dim)',
            flexShrink: 0,
          }}
        />
        <span className="label" style={{ fontSize: 11 }}>{running ? 'Running' : 'Stopped'}</span>
        {status && (
          <>
            <span className="label" style={{ fontSize: 11 }}>{status.botCount} total</span>
            <span className="label" style={{ fontSize: 11 }}>{communityBots.length} community</span>
            <span className="label" style={{ fontSize: 11 }}>{activeGoals.length} goals</span>
            <span className="label" style={{ fontSize: 11 }}>{status.tickCount} ticks</span>
          </>
        )}
        <div className="flex-1" />
        <Button
          size="sm"
          variant={running ? 'secondary' : 'primary'}
          onClick={() => (running ? stopMut : startMut).mutate()}
          disabled={mutLoading}
        >
          {running ? 'Stop' : 'Start'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => runNowMut.mutate()}
          disabled={mutLoading || !running}
        >
          Run Now
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto px-6 py-4" style={{ borderRight: '1px solid var(--border)' }}>
          {isLoading && (
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
            </div>
          )}
          {!isLoading && bots.length === 0 && (
            <EmptyState message="No bots registered yet" />
          )}
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {bots.map(bot => <BotCard key={bot.id} bot={bot} goal={goalByBotId[bot.id]} />)}
          </div>
        </section>

        <aside style={{ width: 340, flexShrink: 0 }} className="flex flex-col">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="label">Bot Thread</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {thread.length === 0 ? (
              <EmptyState message="No messages yet" />
            ) : (
              thread.map(msg => <ThreadMessage key={msg.id} msg={msg} />)
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
