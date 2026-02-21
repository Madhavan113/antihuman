import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../api/services'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.list,
    refetchInterval: 15_000,
  })
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.get(id),
    enabled: Boolean(id),
  })
}

export function useServiceRequests() {
  return useQuery({
    queryKey: ['services', 'requests'],
    queryFn: servicesApi.requests,
    refetchInterval: 15_000,
  })
}

export function useServiceReviews(serviceId: string) {
  return useQuery({
    queryKey: ['services', 'reviews', serviceId],
    queryFn: () => servicesApi.reviews(serviceId),
    enabled: Boolean(serviceId),
  })
}
