import { useQuery } from '@tanstack/react-query'
import { clawdbotsApi } from '../api/clawdbots'

export function useClawdbotStatus() {
  return useQuery({
    queryKey: ['clawdbots', 'status'],
    queryFn: clawdbotsApi.status,
    refetchInterval: 10_000,
    retry: 2,
    retryDelay: 1_000,
    staleTime: 8_000,
  })
}

export function useClawdbots() {
  return useQuery({
    queryKey: ['clawdbots', 'bots'],
    queryFn: clawdbotsApi.bots,
    refetchInterval: 15_000,
    retry: 2,
    retryDelay: 1_000,
    staleTime: 10_000,
  })
}

export function useClawdbotThread(limit = 50) {
  return useQuery({
    queryKey: ['clawdbots', 'thread', limit],
    queryFn: () => clawdbotsApi.thread(limit),
    refetchInterval: 5_000,
    retry: 2,
    retryDelay: 1_000,
    staleTime: 4_000,
  })
}

export function useClawdbotGoals(botId?: string) {
  return useQuery({
    queryKey: ['clawdbots', 'goals', botId ?? 'all'],
    queryFn: () => clawdbotsApi.goals(botId),
    refetchInterval: 5_000,
    retry: 2,
    retryDelay: 1_000,
    staleTime: 4_000,
  })
}
