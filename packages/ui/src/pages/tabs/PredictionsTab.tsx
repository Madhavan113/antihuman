import { useMemo, useState } from 'react'
import type { MarketStatus } from '../../api/types'
import { Drawer } from '../../components/Drawer'
import { MarketCard } from '../../components/MarketCard'
import { SkeletonRow } from '../../components/Skeleton'
import { EmptyState } from '../../components/ui'
import { useMarketBetsByIds, useMarkets } from '../../hooks/useMarkets'
import { MarketDetail } from '../MarketDetail'

const STATUS_FILTERS: Array<MarketStatus | 'ALL'> = ['ALL', 'OPEN', 'RESOLVED', 'CLOSED', 'DISPUTED']

export function PredictionsTab() {
  const { data: markets = [], isLoading } = useMarkets()
  const [filter, setFilter] = useState<MarketStatus | 'ALL'>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = filter === 'ALL' ? markets : markets.filter(m => m.status === filter)
  const filteredIds = useMemo(() => filtered.map(m => m.id), [filtered])
  const betSnapshots = useMarketBetsByIds(filteredIds)
  const stakeByMarketId: Record<string, Record<string, number>> = {}

  for (const [index, query] of betSnapshots.entries()) {
    const marketId = filteredIds[index]
    if (!marketId || !query.data?.stakeByOutcome) continue
    stakeByMarketId[marketId] = query.data.stakeByOutcome
  }

  return (
    <>
      <div className="flex items-center gap-2 px-6 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="label transition-colors duration-150"
            style={{
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid',
              cursor: 'pointer',
              background: filter === s ? 'var(--accent-dim)' : 'transparent',
              borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
              color: filter === s ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto label">{filtered.length} shown</span>
      </div>

      <div className="flex flex-col">
        {isLoading && Array.from({ length: 6 }, (_, i) => <SkeletonRow key={i} />)}

        {filtered.map(market => (
          <MarketCard
            key={market.id}
            market={market}
            horizontal
            stakeByOutcome={stakeByMarketId[market.id]}
            onClick={() => setSelectedId(market.id)}
          />
        ))}

        {!isLoading && filtered.length === 0 && (
          <EmptyState message="No markets match filter" />
        )}
      </div>

      <Drawer open={Boolean(selectedId)} onClose={() => setSelectedId(null)}>
        {selectedId && <MarketDetail marketId={selectedId} />}
      </Drawer>
    </>
  )
}
