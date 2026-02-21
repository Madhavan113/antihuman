import { Button } from './ui/Button'

export function EngineControl({
  label,
  running,
  onStart,
  onStop,
  isLoading,
}: {
  label: string
  running: boolean
  onStart: () => void
  onStop: () => void
  isLoading: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-1.5"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: running ? 'var(--success)' : 'var(--text-dim)',
          flexShrink: 0,
        }}
      />
      <span className="label" style={{ fontSize: 11, flex: 1 }}>{label}</span>
      <Button
        size="sm"
        variant={running ? 'secondary' : 'primary'}
        onClick={running ? onStop : onStart}
        disabled={isLoading}
        style={{ padding: '2px 10px', fontSize: 11 }}
      >
        {running ? 'Stop' : 'Start'}
      </Button>
    </div>
  )
}
