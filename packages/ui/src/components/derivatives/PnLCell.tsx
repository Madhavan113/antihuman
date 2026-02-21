interface PnLCellProps {
  value: number
  suffix?: string
}

export function PnLCell({ value, suffix = ' HBAR' }: PnLCellProps) {
  const positive = value >= 0
  return (
    <span style={{
      color: positive ? 'var(--success)' : 'var(--danger)',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 12,
    }}>
      {positive ? '+' : ''}{value.toFixed(2)}{suffix}
    </span>
  )
}
