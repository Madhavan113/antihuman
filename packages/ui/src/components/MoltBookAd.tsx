import { useState } from 'react'
import type { Service, MoltBookBuyResult } from '../api/services'
import { servicesApi } from '../api/services'

interface MoltBookAdProps {
  service: Service
  agentName?: string
}

export function MoltBookAd({ service, agentName }: MoltBookAdProps) {
  const [mode, setMode] = useState<'idle' | 'input' | 'loading' | 'done'>('idle')
  const [input, setInput] = useState('')
  const [result, setResult] = useState<MoltBookBuyResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleBuy = async () => {
    if (!input.trim()) return
    setMode('loading')
    setError(null)
    try {
      const res = await servicesApi.buy(service.id, input.trim())
      setResult(res)
      setMode('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setMode('input')
    }
  }

  const reset = () => { setMode('idle'); setInput(''); setResult(null); setError(null) }

  return (
    <>
      {/* Compact listing row */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150"
        style={{
          borderBottom: '1px solid var(--border)',
          cursor: mode === 'idle' ? 'pointer' : undefined,
          background: mode !== 'idle' ? 'var(--bg-raised)' : undefined,
        }}
        onClick={() => mode === 'idle' && setMode('input')}
        onMouseEnter={e => { if (mode === 'idle') e.currentTarget.style.background = 'var(--bg-raised)' }}
        onMouseLeave={e => { if (mode === 'idle') e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, minWidth: 52 }}>
          {service.category}
        </span>
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
            {service.name}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>
            {agentName ?? service.providerAccountId}
          </span>
        </div>
        <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, flexShrink: 0 }}>
          {service.priceHbar} ℏ
        </span>
        {mode === 'idle' && (
          <button
            onClick={(e) => { e.stopPropagation(); setMode('input') }}
            style={{
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 600,
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer',
              flexShrink: 0,
              letterSpacing: 0.3,
            }}
          >
            BUY
          </button>
        )}
        {mode === 'done' && (
          <button
            onClick={(e) => { e.stopPropagation(); reset() }}
            style={{
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 600,
              background: 'transparent',
              color: 'var(--text-dim)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            CLOSE
          </button>
        )}
      </div>

      {/* Expanded input / result panel */}
      {mode === 'input' && (
        <div className="px-4 py-3" style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>{service.description}</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you need..."
            autoFocus
            style={{
              width: '100%',
              minHeight: 48,
              padding: 8,
              fontSize: 12,
              fontFamily: 'inherit',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              resize: 'none',
              outline: 'none',
            }}
          />
          {error && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 3 }}>{error}</p>}
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={reset} style={{ padding: '4px 12px', fontSize: 11, background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={handleBuy}
              disabled={!input.trim()}
              style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, background: input.trim() ? 'var(--accent)' : 'var(--bg-surface)', color: input.trim() ? '#000' : 'var(--text-dim)', border: 'none', borderRadius: 3, cursor: input.trim() ? 'pointer' : 'default' }}
            >
              Purchase · {service.priceHbar} HBAR
            </button>
          </div>
        </div>
      )}

      {mode === 'loading' && (
        <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            {agentName ?? 'Agent'} is thinking...
          </span>
        </div>
      )}

      {mode === 'done' && result && (
        <div className="px-4 py-3" style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 4,
            padding: 12,
            fontSize: 12,
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            maxHeight: 180,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            border: '1px solid var(--border)',
          }}>
            {result.output}
          </div>
        </div>
      )}
    </>
  )
}
