import type { ServiceRequest } from '../../api/services'
import { StatusBadge } from '../ui/Badge'

interface ServiceRequestRowProps {
  request: ServiceRequest
}

export function ServiceRequestRow({ request }: ServiceRequestRowProps) {
  const created = new Date(request.createdAt)
  const timeAgo = getTimeAgo(created)

  return (
    <div
      className="grid px-4 py-2 transition-colors duration-150"
      style={{
        gridTemplateColumns: '1fr 100px 120px 90px 120px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <div className="flex flex-col justify-center">
        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
          {request.input.length > 60 ? `${request.input.slice(0, 60)}...` : request.input}
        </span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-dim)' }}>
          {request.serviceId}
        </span>
      </div>
      <div className="flex items-center">
        <StatusBadge status={request.status} />
      </div>
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)', alignSelf: 'center' }}>
        {request.requesterAccountId}
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', alignSelf: 'center' }}>
        {request.priceHbar} HBAR
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-dim)', alignSelf: 'center' }}>
        {timeAgo}
      </span>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
