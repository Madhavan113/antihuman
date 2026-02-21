import { apiFetch } from './client'
import type { Agent } from './types'
import type { PerpetualPosition, OptionContract } from './derivatives'

export interface AgentPortfolio {
  accountId: string
  reputation: { score: number; breakdown: Record<string, number> }
  marginAccount: { balanceHbar: number; lockedHbar: number; mode: string } | null
  marketsCreated: Array<{ id: string; question: string; status: string; outcomes: string[] }>
  bets: Array<{ marketId: string; marketQuestion: string; outcome: string; amountHbar: number; placedAt: string }>
  orders: Array<{ marketId: string; outcome: string; side: string; quantity: number; price: number; status: string }>
  positions: PerpetualPosition[]
  optionsWritten: OptionContract[]
  optionsHeld: OptionContract[]
  services: Array<{ id: string; name: string; category: string; priceHbar: number; status: string; completedCount: number }>
  tasksPosted: Array<{ id: string; title: string; category: string; bountyHbar: number; status: string }>
  taskBids: Array<{ taskId: string; taskTitle: string; proposedPriceHbar: number; status: string }>
}

export const agentsApi = {
  list: () => apiFetch<{ agents: Agent[] }>('/agents').then(r => r.agents),
  portfolio: (accountId: string) => apiFetch<AgentPortfolio>(`/agents/${accountId}/portfolio`),
}
