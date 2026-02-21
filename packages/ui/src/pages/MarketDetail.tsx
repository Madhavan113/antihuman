import { useEffect, useMemo, useState } from 'react'
import { HashScanLink } from '../components/HashScanLink'
import { OddsBar } from '../components/OddsBar'
import { StatusBadge } from '../components/ui/Badge'
import { useAgents } from '../hooks/useAgents'
import { useMarket, useMarketBets, useOrderBook } from '../hooks/useMarkets'
import { computeImpliedOdds } from '../utils/odds'

interface MarketDetailProps {
  marketId: string
}

function toResolutionCountdownLabel(closeTime: string, status: string, resolvedAt?: string, nowMs = Date.now()): string {
  if (status === 'RESOLVED') {
    return `Resolved ${resolvedAt ? new Date(resolvedAt).toLocaleString() : 'recently'}`
  }
  const resolveAtMs = Date.parse(closeTime)
  if (!Number.isFinite(resolveAtMs)) return 'Resolution time unavailable'
  const msUntil = resolveAtMs - nowMs
  if (msUntil <= 0) return 'Resolution pending'
  const totalS = Math.floor(msUntil / 1000)
  const d = Math.floor(totalS / 86_400)
  const h = Math.floor((totalS % 86_400) / 3_600)
  const m = Math.floor((totalS % 3_600) / 60)
  const s = totalS % 60
  if (d > 0) return `Resolves in ${d}d ${h}h`
  if (h > 0) return `Resolves in ${h}h ${m}m`
  if (m > 0) return `Resolves in ${m}m ${s}s`
  return `Resolves in ${s}s`
}

function CountdownLabel({ closeTime, status, resolvedAt }: { closeTime: string; status: string; resolvedAt?: string }) {
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    if (status === 'RESOLVED') return
    const timer = window.setInterval(() => setNowMs(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [status])
  const label = toResolutionCountdownLabel(closeTime, status, resolvedAt, nowMs)
  return <p className="label mt-2" style={{ fontSize: 10 }}>{label}</p>
}

export function MarketDetail({ marketId }: MarketDetailProps) {
  const { data: market, isLoading } = useMarket(marketId)
  const { data: betSnapshot } = useMarketBets(marketId)
  const { data: orderBook } = useOrderBook(marketId)
  const { data: agents = [] } = useAgents()

  const odds = useMemo(() => market ? computeImpliedOdds({
    outcomes: market.outcomes,
    initialOddsByOutcome: market.initialOddsByOutcome,
    stakeByOutcome: betSnapshot?.stakeByOutcome,
    resolvedOutcome: market.resolvedOutcome,
  }) : {}, [market, betSnapshot])

  const accountNameById = useMemo(() => agents.reduce<Record<string, string>>((acc, agent) => {
    acc[agent.accountId] = agent.name
    return acc
  }, {}), [agents])

  const sortedVotes = useMemo(() => [...(market?.oracleVotes ?? [])].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)), [market?.oracleVotes])
  const sortedChallenges = useMemo(() => [...(market?.challenges ?? [])].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)), [market?.challenges])

  if (isLoading || !market) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="label">Loading...</span>
      </div>
    )
  }

  const openOrderCount = orderBook?.orders.filter((o: { status: string }) => o.status === 'OPEN').length ?? 0
  const totalStakedHbar = betSnapshot?.totalStakedHbar ?? 0
  const hasStakeSignal = totalStakedHbar > 0
  const pricingSignalLabel = hasStakeSignal
    ? 'Stake-weighted from executed fills'
    : 'Seed listing odds (no executed fills yet)'
  const challenges = market.challenges ?? []
  const oracleVotes = market.oracleVotes ?? []
  const hasDisputeLog = market.status === 'DISPUTED' || Boolean(market.selfAttestation) || challenges.length > 0 || oracleVotes.length > 0

  const stakeByOutcome = Object.fromEntries(
    market.outcomes.map((outcome: string) => [outcome, betSnapshot?.stakeByOutcome?.[outcome] ?? 0]),
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 shrink-0" style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={market.status} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{market.question}</h2>
        {market.description && (
          <p className="mt-1.5" style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{market.description}</p>
        )}
        <CountdownLabel closeTime={market.closeTime} status={market.status} resolvedAt={market.resolvedAt} />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Odds */}
        <section className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="label mb-3">Odds</p>
          <div className="flex items-center justify-between mb-2">
            {market.outcomes.map((o: string) => (
              <div key={o} className="flex flex-col items-center gap-1">
                <span style={{ fontSize: 28, fontWeight: 300, color: 'var(--text-primary)' }}>
                  {odds[o] ?? 0}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>%</span>
                </span>
                <span className="label" style={{ fontSize: 10 }}>{o}</span>
              </div>
            ))}
          </div>
          <OddsBar outcomes={market.outcomes} counts={odds} height={8} />
          <p className="label mt-2" style={{ fontSize: 10 }}>{pricingSignalLabel}</p>
        </section>

        {/* Staked volume */}
        <section className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="label mb-3">Staked Volume</p>
          <div className="flex items-center justify-between mb-2">
            <span className="label" style={{ fontSize: 10 }}>{betSnapshot?.betCount ?? 0} bets</span>
            <span className="font-mono" style={{ fontSize: 12 }}>{totalStakedHbar.toFixed(2)} HBAR</span>
          </div>
          {market.outcomes.map((outcome: string) => (
            <div key={outcome} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-mono" style={{ fontSize: 12 }}>{outcome}</span>
              <span className="font-mono" style={{ fontSize: 12 }}>{(stakeByOutcome[outcome] ?? 0).toFixed(2)} HBAR</span>
            </div>
          ))}
        </section>

        {/* Orderbook */}
        {orderBook && (
          <section className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="label">Order Book</p>
              <span className="label" style={{ fontSize: 10 }}>{openOrderCount} open</span>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <p className="label mb-2" style={{ fontSize: 10, color: 'var(--success)' }}>BIDS</p>
                {orderBook.bids.slice(0, 8).map((o: { id: string; quantity: number; price: number }) => (
                  <div key={o.id} className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="font-mono" style={{ fontSize: 12 }}>{o.quantity}</span>
                    <span className="font-mono" style={{ fontSize: 12, color: 'var(--success)' }}>{o.price}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="label mb-2" style={{ fontSize: 10, color: 'var(--danger)' }}>ASKS</p>
                {orderBook.asks.slice(0, 8).map((o: { id: string; quantity: number; price: number }) => (
                  <div key={o.id} className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="font-mono" style={{ fontSize: 12 }}>{o.quantity}</span>
                    <span className="font-mono" style={{ fontSize: 12, color: 'var(--danger)' }}>{o.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Dispute log */}
        {hasDisputeLog && (
          <section className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="label mb-3">Dispute Log</p>
            {market.selfAttestation && (
              <div className="mb-3 p-3" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-raised)' }}>
                <p className="label mb-1" style={{ fontSize: 10 }}>SELF-ATTESTATION</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {accountNameById[market.selfAttestation.attestedByAccountId] ?? market.selfAttestation.attestedByAccountId} proposed{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{market.selfAttestation.proposedOutcome}</span>
                </p>
                {market.selfAttestation.reason && (
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{market.selfAttestation.reason}</p>
                )}
              </div>
            )}

            <p className="label mb-2" style={{ fontSize: 10 }}>CHALLENGES ({sortedChallenges.length})</p>
            {sortedChallenges.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>No challenges submitted.</p>
            ) : (
              <div className="mb-3">
                {sortedChallenges.map(c => (
                  <div key={c.id} className="py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 12 }}>
                      {accountNameById[c.challengerAccountId] ?? c.challengerAccountId} challenged with{' '}
                      <span style={{ color: 'var(--text-primary)' }}>{c.proposedOutcome}</span>
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.reason}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="label mb-2" style={{ fontSize: 10 }}>ORACLE VOTES ({sortedVotes.length})</p>
            {sortedVotes.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>No oracle votes yet.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {sortedVotes.map(vote => {
                  const isResolved = Boolean(market.resolvedOutcome)
                  const isCorrect = market.resolvedOutcome ? vote.outcome === market.resolvedOutcome : false
                  const repEffect = isResolved ? (isCorrect ? '+6' : '-4') : 'pending'
                  return (
                    <div key={vote.id} className="grid gap-2 py-1" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
                      <span className="font-mono truncate" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {accountNameById[vote.voterAccountId] ?? vote.voterAccountId}
                      </span>
                      <span className="font-mono" style={{ fontSize: 11 }}>{vote.outcome}</span>
                      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{Math.round(vote.confidence * 100)}%</span>
                      <span className="font-mono" style={{ fontSize: 11, color: isCorrect ? 'var(--success)' : isResolved ? 'var(--danger)' : 'var(--text-dim)' }}>
                        {repEffect}
                      </span>
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        {new Date(vote.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* On-chain metadata */}
        <section className="px-6 py-4" style={{ background: 'var(--bg-raised)' }}>
          <p className="label mb-3">On-Chain</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="label" style={{ fontSize: 10 }}>Topic ID</span>
              <HashScanLink id={market.topicId} url={market.topicUrl} />
            </div>
            {market.outcomeTokenIds && (Object.entries(market.outcomeTokenIds) as [string, string][]).map(([outcome, tokenId]) => (
              <div key={outcome} className="flex items-center justify-between">
                <span className="label" style={{ fontSize: 10 }}>{outcome} Token</span>
                <HashScanLink id={tokenId} url={market.outcomeTokenUrls?.[outcome] ?? '#'} />
              </div>
            ))}
            {market.syntheticOutcomeIds && !market.outcomeTokenIds && (Object.entries(market.syntheticOutcomeIds) as [string, string][]).map(([outcome, syntheticId]) => (
              <div key={outcome} className="flex items-center justify-between">
                <span className="label" style={{ fontSize: 10 }}>{outcome} ID</span>
                <span className="font-mono" style={{ fontSize: 11 }}>{syntheticId}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="label" style={{ fontSize: 10 }}>Creator</span>
              <HashScanLink id={market.creatorAccountId} url={`https://hashscan.io/testnet/account/${market.creatorAccountId}`} />
            </div>
            {market.resolvedOutcome && (
              <div className="flex items-center justify-between">
                <span className="label" style={{ fontSize: 10 }}>Resolved</span>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{market.resolvedOutcome}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
