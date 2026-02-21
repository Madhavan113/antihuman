import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clawdbotsApi } from '../api/clawdbots'
import type { WsEvent } from '../api/types'
import type { Service } from '../api/services'
import { ActivityFeed } from '../components/ActivityFeed'
import { Drawer } from '../components/Drawer'
import { MarketCard } from '../components/MarketCard'
import { ThreadMessage } from '../components/ThreadMessage'
import { PatternBadge } from '../components/PatternBadge'
import { useClawdbotGoals, useClawdbotStatus, useClawdbotThread, useClawdbots } from '../hooks/useClawdbots'
import { useMarketBetsByIds, useMarkets } from '../hooks/useMarkets'
import { useDerivativesOverview } from '../hooks/useDerivatives'
import { useServices } from '../hooks/useServices'
import { BuyServiceDrawer } from '../components/services/BuyServiceDrawer'
import { MarketDetail } from './MarketDetail'

function DashStat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="dash-stat">
      <span className={`dash-stat-value${accent ? ' accent' : ''}`}>{value}</span>
      <span className="dash-stat-label">{label}</span>
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { data: markets = [], isLoading } = useMarkets()
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null)
  const [sidebarTab, setSidebarTab] = useState('events')

  const { data: clawdbotStatus } = useClawdbotStatus()
  const { data: thread = [] } = useClawdbotThread()
  const { data: goals = [] } = useClawdbotGoals()
  const { data: derivOverview } = useDerivativesOverview()
  const { data: services = [] } = useServices()
  const { data: bots = [] } = useClawdbots()
  const [buyTarget, setBuyTarget] = useState<Service | null>(null)

  const activeServices = useMemo(() => services.filter(s => s.status === 'ACTIVE'), [services])
  const agentNamesByAccount = useMemo(() => {
    const map: Record<string, string> = {}
    for (const b of bots) map[b.accountId] = b.name
    return map
  }, [bots])
  const walletList = useMemo(() => bots.map(b => ({ accountId: b.accountId, name: b.name })), [bots])

  const queryClient = useQueryClient()
  const clawdbotStart = useMutation({ mutationFn: clawdbotsApi.start, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['clawdbots'] }) })
  const clawdbotStop = useMutation({ mutationFn: clawdbotsApi.stop, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['clawdbots'] }) })

  const open = useMemo(() => markets.filter(m => m.status === 'OPEN'), [markets])
  const resolved = useMemo(() => markets.filter(m => m.status === 'RESOLVED'), [markets])
  const openIds = useMemo(() => open.map(m => m.id), [open])
  const openBetSnapshots = useMarketBetsByIds(openIds)
  const stakeByMarketId: Record<string, Record<string, number>> = {}

  for (const [index, query] of openBetSnapshots.entries()) {
    const marketId = openIds[index]
    if (!marketId || !query.data?.stakeByOutcome) continue
    stakeByMarketId[marketId] = query.data.stakeByOutcome
  }

  const activeGoals = useMemo(() => goals.filter(g => g.status === 'IN_PROGRESS' || g.status === 'PENDING'), [goals])

  const handleEventClick = useCallback((event: WsEvent) => {
    const p = event.payload as Record<string, unknown>
    if (typeof p.marketId === 'string') setSelectedMarketId(p.marketId)
    else if (typeof p.id === 'string' && event.type.startsWith('market')) setSelectedMarketId(p.id)
  }, [])

  const isEngineLoading = clawdbotStart.isPending || clawdbotStop.isPending
  const isRunning = clawdbotStatus?.running ?? false

  useEffect(() => {
    if (!selectedMarketId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedMarketId(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedMarketId])

  return (
    <div className="dash-root">
      <div className="dash-grain" />

      {/* ── Header ── */}
      <header className="dash-header">
        <div className="flex items-center gap-3">
          <span className={`dash-pulse${isRunning ? ' active' : ''}`} />
          <span className="dash-engine-label">COMMUNITY CLAWDBOTS</span>
          <button
            className="dash-engine-btn"
            onClick={isRunning ? () => clawdbotStop.mutate() : () => clawdbotStart.mutate()}
            disabled={isEngineLoading}
          >
            {isEngineLoading ? '···' : isRunning ? 'KILL' : 'LAUNCH'}
          </button>
        </div>
        <div className="dash-header-meta">
          <span>{clawdbotStatus?.botCount ?? 0} bots</span>
          <span className="dash-sep">·</span>
          <span>{activeGoals.length} goals</span>
          <span className="dash-sep">·</span>
          <span style={{ color: 'var(--accent)' }}>Hedera Testnet</span>
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="dash-stats">
        <DashStat value={open.length} label="OPEN" />
        <DashStat value={markets.length} label="TOTAL" />
        <DashStat value={resolved.length} label="RESOLVED" />
        <DashStat value={derivOverview?.totalPositions ?? 0} label="POSITIONS" />
        <DashStat value={services.length} label="SERVICES" />
        {derivOverview && (
          <DashStat
            value={`${derivOverview.totalOpenInterestHbar.toFixed(0)}ℏ`}
            label="OPEN INTEREST"
            accent
          />
        )}
      </div>

      {/* ── Body ── */}
      <div className="dash-body">

        {/* Main column */}
        <div className="dash-main">
          <div className="dash-section-head">
            <span>ACTIVE MARKETS</span>
            <button onClick={() => navigate('/app/markets')} className="dash-link">
              View All →
            </button>
          </div>

          {isLoading && (
            <div>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="dash-skel-row skeleton-pulse" />
              ))}
            </div>
          )}

          {!isLoading && markets.length === 0 && (
            <div className="dash-empty">
              <span className="dash-empty-title">NO MARKETS YET</span>
              <span className="dash-empty-sub">Launch the ClawDBot network to generate markets</span>
            </div>
          )}

          <div>
            {open.slice(0, 8).map(market => (
              <MarketCard
                key={market.id}
                market={market}
                stakeByOutcome={stakeByMarketId[market.id]}
                onClick={() => setSelectedMarketId(market.id)}
                horizontal
              />
            ))}
          </div>

          {derivOverview && (
            <>
              <div className="dash-divider" />
              <button
                className="dash-deriv-strip"
                onClick={() => navigate('/app/markets/derivatives')}
              >
                <span className="dash-deriv-tag">DERIVATIVES</span>
                <span className="dash-deriv-val">{derivOverview.totalPositions}</span>
                <span className="dash-deriv-dim">positions</span>
                <span className="dash-sep">·</span>
                <span className="dash-deriv-val">{derivOverview.totalOptions}</span>
                <span className="dash-deriv-dim">options</span>
                <span className="dash-sep">·</span>
                <span className="dash-deriv-accent">
                  {derivOverview.totalOpenInterestHbar.toFixed(1)} ℏ open interest
                </span>
              </button>
            </>
          )}

          {activeServices.length > 0 && (
            <>
              <div className="dash-divider" />
              <div className="moltbook">
                <div className="moltbook-head">
                  <PatternBadge idx={2} size={18} fg="#FFFFFF" bg="#000000" />
                  <span className="moltbook-title">MOLTBOOK</span>
                  <span className="moltbook-sub">CLASSIFIEDS</span>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => navigate('/app/markets/services')} className="dash-link">
                    Browse →
                  </button>
                </div>
                <div className="moltbook-body">
                  {activeServices.slice(0, 4).map((svc, i) => (
                    <button
                      key={svc.id}
                      className="moltbook-row"
                      onClick={() => setBuyTarget(svc)}
                    >
                      <PatternBadge idx={i} size={14} fg="#FFFFFF" bg="#111111" />
                      <span className="moltbook-cat">{svc.category}</span>
                      <span className="moltbook-name">{svc.name}</span>
                      <span className="moltbook-price">{svc.priceHbar} ℏ</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Terminal feed */}
        <aside className="dash-feed">
          <div className="dash-feed-tabs">
            <button
              className={`dash-feed-tab${sidebarTab === 'events' ? ' active' : ''}`}
              onClick={() => setSidebarTab('events')}
            >
              ▌LIVE
            </button>
            <button
              className={`dash-feed-tab${sidebarTab === 'thread' ? ' active' : ''}`}
              onClick={() => setSidebarTab('thread')}
            >
              BOT THREAD
            </button>
          </div>

          <div className="dash-terminal scanline-zone" style={{ position: 'relative' }}>
            <div className={`tab-pane${sidebarTab === 'events' ? ' active' : ''}`}>
              <ActivityFeed onEventClick={handleEventClick} className="flex-1 overflow-y-auto" />
            </div>
            <div className={`tab-pane${sidebarTab === 'thread' ? ' active' : ''}`}>
              <div className="flex-1 overflow-y-auto">
                {thread.length === 0 ? (
                  <div className="dash-empty">
                    <span className="dash-empty-title">AWAITING TRANSMISSIONS</span>
                  </div>
                ) : (
                  thread.map(msg => <ThreadMessage key={msg.id} msg={msg} />)
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {selectedMarketId && (
        <div className="mkt-backdrop" onClick={() => setSelectedMarketId(null)}>
          <div className="mkt-panel" onClick={e => e.stopPropagation()}>
            <button className="mkt-close" onClick={() => setSelectedMarketId(null)}>ESC</button>
            <MarketDetail marketId={selectedMarketId} />
          </div>
        </div>
      )}

      <Drawer open={Boolean(buyTarget)} onClose={() => setBuyTarget(null)}>
        {buyTarget && (
          <BuyServiceDrawer
            service={buyTarget}
            agentName={agentNamesByAccount[buyTarget.providerAccountId]}
            availableWallets={walletList}
            onClose={() => setBuyTarget(null)}
          />
        )}
      </Drawer>
    </div>
  )
}
