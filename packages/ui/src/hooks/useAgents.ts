import { useQuery } from '@tanstack/react-query'
import { agentsApi } from '../api/agents'

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: agentsApi.list,
    refetchInterval: 15_000,
    staleTime: 10_000,
  })
}

export function useAgentPortfolio(accountId: string | undefined) {
  return useQuery({
    queryKey: ['agent-portfolio', accountId],
    queryFn: () => agentsApi.portfolio(accountId!),
    enabled: Boolean(accountId),
    refetchInterval: 10_000,
    staleTime: 5_000,
  })
}
