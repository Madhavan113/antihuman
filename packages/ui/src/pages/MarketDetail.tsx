import { useEffect, useMemo, useState } from 'react'
import { HashScanLink } from '../components/HashScanLink'
import { OddsBar } from '../components/OddsBar'
import { useAgents } from '../hooks/useAgents'
import { useMarket, useMarketBets, useOrderBook } from '../hooks/useMarkets'
import { computeImpliedOdds } from '../utils/odds'

interface MarketDetailProps {
  marketId: string
}

function toCountdown(closeTime: string, status: string, resolvedAt?: string, nowMs = Date.now()): string {
  if (status === 'RESOLVED') {
    return `RESOLVED ${resolvedAt ? new Date(resolvedAt).toLocaleString() : 'RECENTLY'}`
  }
  const ms = Date.parse(closeTime) - nowMs
  if (!Number.isFinite(ms) || ms <= 0) return 'RESOLUTION PENDING'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86_400)
  const h = Math.floor((s % 86_400) / 3_600)
  const m = Math.floor((s % 3_600) / 60)
  if (d > 0) return `RESOLVES IN ${d}D ${h}H`
  if (h > 0) return `RESOLVES IN ${h}H ${m}M`
  return `RESOLVES IN ${m}M ${s % 60}S`
}

function Countdown({ closeTime, status, resolvedAt }: { closeTime: string; status: string; resolvedAt?: string }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (status === 'RESOLVED') return
    const t = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(t)
  }, [status])
  return <p className="mkt-countdown">{toCountdown(closeTime, status, resolvedAt, now)}</p>
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

  const names = useMemo(() => agents.reduce<Record<string, string>>((a, ag) => {
    a[ag.accountId] = ag.name
    return a
  }, {}), [agents])

  const sortedVotes = useMemo(() => [...(market?.oracleVotes ?? [])].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)), [market?.oracleVotes])
  const sortedChallenges = useMemo(() => [...(market?.challenges ?? [])].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)), [market?.challenges])

  if (isLoading || !market) {
    return (
      <div className="flex items-center justify-center" style={{ padding: 80 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#3A3A3A' }}>LOADING</span>
      </div>
    )
  }

  const openOrders = orderBook?.orders.filter((o: { status: string }) => o.status === 'OPEN').length ?? 0
  const totalHbar = betSnapshot?.totalStakedHbar ?? 0
  const signalLabel = totalHbar > 0 ? 'Stake-weighted from executed fills' : 'Seed listing odds — no fills yet'
  const challenges = market.challenges ?? []
  const oracleVotes = market.oracleVotes ?? []
  const hasDispute = market.status === 'DISPUTED' || Boolean(market.selfAttestation) || challenges.length > 0 || oracleVotes.length > 0

  const stakeByOutcome = Object.fromEntries(
    market.outcomes.map((o: string) => [o, betSnapshot?.stakeByOutcome?.[o] ?? 0]),
  )

  return (
    <div>
      {/* Header */}
      <div className="mkt-header">
        <span className="mkt-status">{market.status}</span>
        <h2 className="mkt-question">{market.question}</h2>
        {market.description && <p className="mkt-desc">{market.description}</p>}
        <Countdown closeTime={market.closeTime} status={market.status} resolvedAt={market.resolvedAt} />
      </div>

      <div className="mkt-rule" />

      {/* Odds */}
      <div className="mkt-section">
        <div className="mkt-odds">
          {market.outcomes.map((o: string) => (
            <div key={o} className="mkt-odds-col">
              <span className="mkt-odds-val">
                {odds[o] ?? 0}<span className="mkt-odds-pct">%</span>
              </span>
              <span className="mkt-odds-label">{o}</span>
            </div>
          ))}
        </div>
        <OddsBar outcomes={market.outcomes} counts={odds} height={3} />
        <p className="mkt-signal">{signalLabel}</p>
      </div>

      <div className="mkt-rule" />

      {/* Orderbook */}
      {orderBook && (
        <>
          <div className="mkt-section">
            <div className="mkt-section-head">
              <span>ORDER BOOK</span>
              <span className="mkt-section-meta">{openOrders} open</span>
            </div>
            <div className="mkt-book">
              <div className="mkt-book-col" style={{ paddingRight: 16 }}>
                <div className="mkt-book-label" style={{ color: 'var(--success)' }}>BIDS</div>
                {orderBook.bids.length === 0 && <span className="mkt-book-empty">—</span>}
                {orderBook.bids.slice(0, 8).map((o: { id: string; quantity: number; price: number }) => (
                  <div key={o.id} className="mkt-book-row">
                    <span className="mkt-book-qty">{o.quantity}</span>
                    <span className="mkt-book-price" style={{ color: 'var(--success)' }}>{o.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mkt-book-mid" />
              <div className="mkt-book-col" style={{ paddingLeft: 16 }}>
                <div className="mkt-book-label" style={{ color: 'var(--danger)' }}>ASKS</div>
                {orderBook.asks.length === 0 && <span className="mkt-book-empty">—</span>}
                {orderBook.asks.slice(0, 8).map((o: { id: string; quantity: number; price: number }) => (
                  <div key={o.id} className="mkt-book-row">
                    <span className="mkt-book-qty">{o.quantity}</span>
                    <span className="mkt-book-price" style={{ color: 'var(--danger)' }}>{o.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mkt-rule" />
        </>
      )}

      {/* Volume */}
      <div className="mkt-section">
        <div className="mkt-section-head"><span>VOLUME</span></div>
        <div className="mkt-vol-summary">
          <span>{betSnapshot?.betCount ?? 0} bets</span>
          <span>{totalHbar.toFixed(2)} HBAR</span>
        </div>
        {market.outcomes.map((o: string) => (
          <div key={o} className="mkt-vol-row">
            <span className="mkt-vol-outcome">{o}</span>
            <span className="mkt-vol-val">{(stakeByOutcome[o] ?? 0).toFixed(2)} HBAR</span>
          </div>
        ))}
      </div>

      {/* Dispute log */}
      {hasDispute && (
        <>
          <div className="mkt-rule" />
          <div className="mkt-section">
            <div className="mkt-section-head"><span>DISPUTE LOG</span></div>

            {market.selfAttestation && (
              <div className="mkt-attestation">
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: '#3A3A3A', marginBottom: 6 }}>SELF-ATTESTATION</p>
                <p style={{ fontSize: 12, color: '#777' }}>
                  {names[market.selfAttestation.attestedByAccountId] ?? market.selfAttestation.attestedByAccountId}{' '}
                  proposed <span style={{ color: '#FFF' }}>{market.selfAttestation.proposedOutcome}</span>
                </p>
                {market.selfAttestation.reason && (
                  <p style={{ fontSize: 12, color: '#3A3A3A', marginTop: 4 }}>{market.selfAttestation.reason}</p>
                )}
              </div>
            )}

            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: '#3A3A3A', marginBottom: 8 }}>
              CHALLENGES ({sortedChallenges.length})
            </p>
            {sortedChallenges.length === 0 ? (
              <p style={{ fontSize: 12, color: '#3A3A3A', marginBottom: 14 }}>None.</p>
            ) : (
              <div style={{ marginBottom: 14 }}>
                {sortedChallenges.map(c => (
                  <div key={c.id} className="mkt-dispute-row">
                    <p style={{ fontSize: 12, color: '#777' }}>
                      {names[c.challengerAccountId] ?? c.challengerAccountId} challenged →{' '}
                      <span style={{ color: '#FFF' }}>{c.proposedOutcome}</span>
                    </p>
                    <p style={{ fontSize: 11, color: '#3A3A3A' }}>{c.reason}</p>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: '#3A3A3A', marginBottom: 8 }}>
              ORACLE VOTES ({sortedVotes.length})
            </p>
            {sortedVotes.length === 0 ? (
              <p style={{ fontSize: 12, color: '#3A3A3A' }}>None yet.</p>
            ) : (
              <div className="flex flex-col">
                {sortedVotes.map(vote => {
                  const resolved = Boolean(market.resolvedOutcome)
                  const correct = market.resolvedOutcome ? vote.outcome === market.resolvedOutcome : false
                  const rep = resolved ? (correct ? '+6' : '-4') : '...'
                  return (
                    <div
                      key={vote.id}
                      className="grid gap-2 py-1.5"
                      style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    >
                      <span className="font-mono truncate" style={{ fontSize: 11, color: '#777' }}>
                        {names[vote.voterAccountId] ?? vote.voterAccountId}
                      </span>
                      <span className="font-mono" style={{ fontSize: 11, color: '#FFF' }}>{vote.outcome}</span>
                      <span className="font-mono" style={{ fontSize: 11, color: '#555' }}>{Math.round(vote.confidence * 100)}%</span>
                      <span className="font-mono" style={{ fontSize: 11, color: correct ? 'var(--success)' : resolved ? 'var(--danger)' : '#3A3A3A' }}>
                        {rep}
                      </span>
                      <span className="font-mono" style={{ fontSize: 10, color: '#3A3A3A' }}>
                        {new Date(vote.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* On-chain */}
      <div className="mkt-rule" />
      <div className="mkt-section">
        <div className="mkt-section-head"><span>ON-CHAIN</span></div>
        <div className="mkt-chain-row">
          <span className="mkt-chain-label">Topic ID</span>
          <HashScanLink id={market.topicId} url={market.topicUrl} />
        </div>
        {market.outcomeTokenIds && (Object.entries(market.outcomeTokenIds) as [string, string][]).map(([outcome, tokenId]) => (
          <div key={outcome} className="mkt-chain-row">
            <span className="mkt-chain-label">{outcome} Token</span>
            <HashScanLink id={tokenId} url={market.outcomeTokenUrls?.[outcome] ?? '#'} />
          </div>
        ))}
        {market.syntheticOutcomeIds && !market.outcomeTokenIds && (Object.entries(market.syntheticOutcomeIds) as [string, string][]).map(([outcome, syntheticId]) => (
          <div key={outcome} className="mkt-chain-row">
            <span className="mkt-chain-label">{outcome} ID</span>
            <span className="font-mono" style={{ fontSize: 11, color: '#777' }}>{syntheticId}</span>
          </div>
        ))}
        <div className="mkt-chain-row">
          <span className="mkt-chain-label">Creator</span>
          <HashScanLink id={market.creatorAccountId} url={`https://hashscan.io/testnet/account/${market.creatorAccountId}`} />
        </div>
        {market.resolvedOutcome && (
          <div className="mkt-chain-row">
            <span className="mkt-chain-label">Resolved</span>
            <span className="font-mono" style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600 }}>{market.resolvedOutcome}</span>
          </div>
        )}
      </div>
    </div>
  )
}
