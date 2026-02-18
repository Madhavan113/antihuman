import { useEffect, useRef, useState } from 'react'
import type { WsEvent } from '../api/types'
import { useWebSocket } from '../hooks/useWebSocket'

const MAX_EVENTS = 200

function eventLabel(type: string): string {
  return type.replace('.', ' ').toUpperCase()
}

function eventSummary(event: WsEvent): string {
  const p = event.payload as Record<string, unknown>
  if (typeof p.question === 'string') return p.question
  if (typeof p.marketId === 'string') return `Market ${String(p.marketId).slice(0, 8)}`
  if (typeof p.name === 'string') return p.name
  return event.type
}

interface ActivityFeedProps {
  onEventClick?: (event: WsEvent) => void
  className?: string
}

export function ActivityFeed({ onEventClick, className = '' }: ActivityFeedProps) {
  const [events, setEvents] = useState<WsEvent[]>([])
  const { subscribe } = useWebSocket()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return subscribe((event) => {
      setEvents((prev) => {
        const next = [event, ...prev]
        return next.slice(0, MAX_EVENTS)
      })
    })
  }, [subscribe])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  if (events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <p className="label">Waiting for events…</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-0 overflow-y-auto ${className}`}>
      {events.map((event, i) => (
        <button
          key={i}
          onClick={() => onEventClick?.(event)}
          className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-raised border-b transition-colors"
          style={{ borderColor: 'var(--border)', background: 'transparent', cursor: 'pointer' }}
        >
          <span className="font-mono text-xs shrink-0" style={{ color: 'var(--text-dim)', minWidth: 70 }}>
            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span
            className="label shrink-0"
            style={{ fontSize: 10, color: 'var(--accent)', borderColor: 'var(--accent-dim)', border: '1px solid', padding: '1px 6px', borderRadius: 3 }}
          >
            {eventLabel(event.type)}
          </span>
          <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {eventSummary(event)}
          </span>
        </button>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
