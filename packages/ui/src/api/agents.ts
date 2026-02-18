import { apiFetch } from './client'
import type { Agent } from './types'

export const agentsApi = {
  list: () => apiFetch<{ agents: Agent[] }>('/agents').then(r => r.agents),
}
