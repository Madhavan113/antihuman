import { apiFetch } from './client'
import type { ReputationLeaderboardEntry, TrustGraph } from './types'

export const reputationApi = {
  leaderboard: () =>
    apiFetch<{ leaderboard: ReputationLeaderboardEntry[] }>('/reputation/leaderboard').then(r => r.leaderboard),
  trustGraph: () =>
    apiFetch<{ graph: TrustGraph }>('/reputation/trust-graph').then(r => r.graph),
}
