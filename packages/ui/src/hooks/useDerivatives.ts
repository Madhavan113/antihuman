import { useQuery } from '@tanstack/react-query'
import { derivativesApi } from '../api/derivatives'

export function usePositions() {
  return useQuery({
    queryKey: ['derivatives', 'positions'],
    queryFn: derivativesApi.positions,
    refetchInterval: 15_000,
  })
}

export function usePosition(id: string) {
  return useQuery({
    queryKey: ['derivatives', 'positions', id],
    queryFn: () => derivativesApi.position(id),
    enabled: Boolean(id),
  })
}

export function useOptions() {
  return useQuery({
    queryKey: ['derivatives', 'options'],
    queryFn: derivativesApi.options,
    refetchInterval: 15_000,
  })
}

export function useMarginAccount(accountId: string) {
  return useQuery({
    queryKey: ['derivatives', 'margin', accountId],
    queryFn: () => derivativesApi.marginAccount(accountId),
    enabled: Boolean(accountId),
  })
}

export function useFundingRates(marketId: string) {
  return useQuery({
    queryKey: ['derivatives', 'funding', marketId],
    queryFn: () => derivativesApi.fundingRates(marketId),
    enabled: Boolean(marketId),
    refetchInterval: 30_000,
  })
}

export function useDerivativesOverview() {
  return useQuery({
    queryKey: ['derivatives', 'overview'],
    queryFn: derivativesApi.overview,
    refetchInterval: 15_000,
  })
}
