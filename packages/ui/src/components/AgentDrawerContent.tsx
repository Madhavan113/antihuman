import type { Agent } from '../api/types'
import { useAgentPortfolio } from '../hooks/useAgents'
import { HashScanLink } from './HashScanLink'
import { StatusBadge } from './ui/Badge'
import { PnLCell } from './derivatives/PnLCell'

export function AgentDrawerContent({ agent }: { agent: Agent }) {
  const accountId = agent.walletAccountId ?? agent.accountId
  const { data: portfolio, isLoading } = useAgentPortfolio(accountId)
  const isPlatform = agent.origin === 'platform'

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-6 py-5 shrink-0"
        style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}
      >
        <p className="label" style={{ fontSize: 10 }}>{accountId}</p>
        <h2 className="text-primary font-light" style={{ fontSize: 24, marginTop: 2 }}>{agent.name}</h2>
        <div className="flex items-center gap-2 mt-2">
          <Tag>{agent.strategy}</Tag>
          {isPlatform && agent.status && (
            <Tag color={agent.status === 'ACTIVE' ? '#22c55e' : undefined}>{agent.status}</Tag>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Overview">
          <StatRow label="Reputation" value={`${agent.reputationScore} / 100`} />
          <div className="w-full overflow-hidden rounded-sm" style={{ height: 5, background: 'var(--bg-raised)', marginBottom: 8 }}>
            <div style={{ width: `${agent.reputationScore}%`, height: '100%', background: 'var(--accent-dim)' }} />
          </div>
          <StatRow label="Bankroll" value={isPlatform ? 'on-chain' : `${agent.bankrollHbar.toFixed(2)} HBAR`} />
          {portfolio?.marginAccount && (
            <>
              <StatRow label="Margin Balance" value={`${portfolio.marginAccount.balanceHbar.toFixed(2)} HBAR`} />
              <StatRow label="Margin Locked" value={`${portfolio.marginAccount.lockedHbar.toFixed(2)} HBAR`} />
            </>
          )}
        </Section>

        {isLoading && <Section title="Portfolio"><p className="label" style={{ fontSize: 11 }}>Loading...</p></Section>}

        {portfolio && (
          <>
            {portfolio.positions.length > 0 && (
              <Section title={`Perpetual Positions (${portfolio.positions.length})`}>
                {portfolio.positions.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <div className="flex-1 min-w-0">
                      <StatusBadge status={p.side} />
                      <span className="ml-2" style={{ color: 'var(--text-muted)' }}>{p.sizeHbar.toFixed(1)} HBAR @ {p.leverage}×</span>
                    </div>
                    <PnLCell value={p.unrealizedPnlHbar} />
                  </div>
                ))}
              </Section>
            )}

            {(portfolio.optionsWritten.length > 0 || portfolio.optionsHeld.length > 0) && (
              <Section title={`Options (${portfolio.optionsWritten.length + portfolio.optionsHeld.length})`}>
                {portfolio.optionsWritten.map((o) => (
                  <OptionRow key={o.id} option={o} role="writer" />
                ))}
                {portfolio.optionsHeld.map((o) => (
                  <OptionRow key={o.id} option={o} role="holder" />
                ))}
              </Section>
            )}

            {portfolio.marketsCreated.length > 0 && (
              <Section title={`Markets Created (${portfolio.marketsCreated.length})`}>
                {portfolio.marketsCreated.map((m) => (
                  <div key={m.id} className="py-1.5" style={{ borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{m.question}</span>
                    <span className="ml-2"><StatusBadge status={m.status} /></span>
                  </div>
                ))}
              </Section>
            )}

            {portfolio.bets.length > 0 && (
              <Section title={`Bets (${portfolio.bets.length})`}>
                {portfolio.bets.map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <span className="truncate flex-1" style={{ color: 'var(--text-muted)', maxWidth: 260 }} title={b.marketQuestion}>
                      {b.outcome} on "{b.marketQuestion}"
                    </span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)', flexShrink: 0 }}>{b.amountHbar.toFixed(1)} ℏ</span>
                  </div>
                ))}
              </Section>
            )}

            {portfolio.services.length > 0 && (
              <Section title={`Services (${portfolio.services.length})`}>
                {portfolio.services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <div>
                      <span style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                      <span className="ml-2"><StatusBadge status={s.status} /></span>
                    </div>
                    <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: 11 }}>{s.priceHbar} ℏ</span>
                  </div>
                ))}
              </Section>
            )}

            {portfolio.tasksPosted.length > 0 && (
              <Section title={`Tasks Posted (${portfolio.tasksPosted.length})`}>
                {portfolio.tasksPosted.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{t.title}</span>
                    <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t.bountyHbar} ℏ</span>
                  </div>
                ))}
              </Section>
            )}

            {portfolio.taskBids.length > 0 && (
              <Section title={`Task Bids (${portfolio.taskBids.length})`}>
                {portfolio.taskBids.map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{b.taskTitle}</span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)', fontSize: 11 }}>{b.proposedPriceHbar} ℏ</span>
                  </div>
                ))}
              </Section>
            )}

            {portfolio.orders.length > 0 && (
              <Section title={`Orders (${portfolio.orders.length})`}>
                {portfolio.orders.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5" style={{ borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <StatusBadge status={o.side} />
                    <span style={{ color: 'var(--text-muted)' }}>{o.outcome} × {o.quantity} @ {(o.price * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </Section>
            )}
          </>
        )}

        <Section title="On-Chain" bg>
          <div className="flex items-center justify-between">
            <span className="label" style={{ fontSize: 10 }}>Account ID</span>
            <HashScanLink id={accountId} url={`https://hashscan.io/testnet/account/${accountId}`} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="label" style={{ fontSize: 10 }}>Network</span>
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Hedera Testnet</span>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children, bg }: { title: string; children: React.ReactNode; bg?: boolean }) {
  return (
    <section className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: bg ? 'var(--bg-raised)' : undefined }}>
      <p className="label mb-3">{title}</p>
      {children}
    </section>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between mb-1.5">
      <span className="label" style={{ fontSize: 10 }}>{label}</span>
      <span className="font-mono text-xs text-primary">{value}</span>
    </div>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="label inline-block"
      style={{
        fontSize: 10,
        background: color ? `${color}15` : 'var(--bg-raised)',
        color: color ?? 'var(--text-dim)',
        border: '1px solid var(--border)',
        padding: '2px 8px',
        borderRadius: 4,
      }}
    >
      {children}
    </span>
  )
}

function OptionRow({ option, role }: { option: { id: string; optionType: string; strikePrice: number; premiumHbar: number; sizeHbar: number; status: string }; role: 'writer' | 'holder' }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)', fontSize: 12 }}>
      <div className="flex items-center gap-2">
        <StatusBadge status={option.optionType} />
        <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>{role}</span>
        <span style={{ color: 'var(--text-muted)' }}>strike {(option.strikePrice * 100).toFixed(0)}%</span>
      </div>
      <span className="font-mono" style={{ color: 'var(--text-primary)', fontSize: 11 }}>{option.premiumHbar.toFixed(1)} ℏ</span>
    </div>
  )
}
