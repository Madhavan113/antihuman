import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { researchApi } from '../api/research'

const FAST_POLL = 5_000
const MED_POLL = 8_000

export function useResearchStatus() {
  return useQuery({
    queryKey: ['research', 'status'],
    queryFn: researchApi.status,
    refetchInterval: FAST_POLL,
  })
}

export function usePublications(params?: { status?: string; focusArea?: string }) {
  return useQuery({
    queryKey: ['research', 'publications', params],
    queryFn: () => researchApi.publications(params),
    refetchInterval: MED_POLL,
  })
}

export function usePublication(id: string | undefined) {
  return useQuery({
    queryKey: ['research', 'publication', id],
    queryFn: () => researchApi.publication(id!),
    enabled: !!id,
    refetchInterval: MED_POLL,
  })
}

export function useResearchAgents() {
  return useQuery({
    queryKey: ['research', 'agents'],
    queryFn: researchApi.agents,
    refetchInterval: FAST_POLL,
  })
}

export function useResearchObservations(limit = 50) {
  return useQuery({
    queryKey: ['research', 'observations', limit],
    queryFn: () => researchApi.observations({ limit }),
    refetchInterval: MED_POLL,
  })
}

export function useResearchStart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: researchApi.start,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['research'] })
    },
  })
}

export function useResearchStop() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: researchApi.stop,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['research'] })
    },
  })
}

export function useResearchRunNow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: researchApi.runNow,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['research'] })
    },
  })
}
