import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../api/client'
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

interface FeedEventEntry {
  key: string
  event: WsEvent
}

export function ActivityFeed({ onEventClick, className = '' }: ActivityFeedProps) {
  const [events, setEvents] = useState<FeedEventEntry[]>([])
  const { subscribe } = useWebSocket()
  const topRef = useRef<HTMLDivElement>(null)
  const serialRef = useRef(0)
  const seededRef = useRef(false)

  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    apiFetch<{ events: WsEvent[] }>('/events/recent?limit=200')
      .then(({ events: history }) => {
        setEvents((prev) => {
          const existingKeys = new Set(prev.map((e) => e.key))
          const seeded: FeedEventEntry[] = history
            .reverse()
            .map((event) => {
              const key = `${event.timestamp}-${event.type}-${serialRef.current++}`
              return { key, event }
            })
            .filter((entry) => !existingKeys.has(entry.key))
          return [...seeded, ...prev].slice(0, MAX_EVENTS)
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    return subscribe((event) => {
      setEvents((prev) => {
        const next = [{ key: `${event.timestamp}-${event.type}-${serialRef.current++}`, event }, ...prev]
        return next.slice(0, MAX_EVENTS)
      })
    })
  }, [subscribe])

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  if (events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <p className="dash-empty-title">WAITING FOR SIGNAL…</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-0 overflow-y-auto ${className}`}>
      <div ref={topRef} />
      {events.map(({ key, event }) => (
        <button
          key={key}
          onClick={() => onEventClick?.(event)}
          className="feed-event"
        >
          <span className="feed-prefix">›</span>
          <span className="feed-ts">
            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="feed-type">
            {eventLabel(event.type)}
          </span>
          <span className="feed-desc">
            {eventSummary(event)}
          </span>
        </button>
      ))}
    </div>
  )
}
