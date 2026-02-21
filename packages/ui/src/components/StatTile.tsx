import { Stat } from './ui/Stat'

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return <Stat label={label} value={value} />
}
