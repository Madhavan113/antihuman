import { apiFetch } from './client'
import type { AutonomyStatus } from './types'

export const autonomyApi = {
  status:  () => apiFetch<AutonomyStatus>('/autonomy/status'),
  start:   () => apiFetch<AutonomyStatus>('/autonomy/start',   { method: 'POST' }),
  stop:    () => apiFetch<AutonomyStatus>('/autonomy/stop',    { method: 'POST' }),
  runNow:  () => apiFetch<AutonomyStatus>('/autonomy/run-now', { method: 'POST' }),
}
