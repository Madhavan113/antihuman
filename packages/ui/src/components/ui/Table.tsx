import type { CSSProperties, ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  width?: string | number
  mono?: boolean
  align?: 'left' | 'right' | 'center'
  render: (row: T, index: number) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T, index: number) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
  compact?: boolean
}

const cellBase: CSSProperties = {
  padding: '6px 12px',
  fontSize: 13,
  lineHeight: '20px',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

export function Table<T>({ columns, data, rowKey, onRowClick, emptyMessage, className = '', compact }: TableProps<T>) {
  const rowH = compact ? 28 : 32

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="label"
                style={{
                  ...cellBase,
                  textAlign: col.align ?? 'left',
                  position: 'sticky',
                  top: 0,
                  background: 'var(--bg-base)',
                  zIndex: 1,
                  height: rowH,
                  width: col.width,
                  fontWeight: 400,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                style={{ ...cellBase, textAlign: 'center', color: 'var(--text-dim)', padding: '32px 12px' }}
              >
                {emptyMessage ?? 'No data'}
              </td>
            </tr>
          )}
          {data.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                cursor: onRowClick ? 'pointer' : undefined,
                background: i % 2 === 1 ? 'var(--bg-surface)' : 'transparent',
                transition: 'background 150ms ease-out',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 === 1 ? 'var(--bg-surface)' : 'transparent' }}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  style={{
                    ...cellBase,
                    height: rowH,
                    textAlign: col.align ?? 'left',
                    fontFamily: col.mono ? 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)' : undefined,
                    fontSize: col.mono ? 12 : 13,
                    color: col.mono ? 'var(--text-muted)' : 'var(--text-primary)',
                  }}
                >
                  {col.render(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
