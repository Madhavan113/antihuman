// Mirror of packages/markets/src/types.ts
export type MarketStatus = 'OPEN' | 'CLOSED' | 'RESOLVED' | 'DISPUTED'

export interface Market {
  id: string
  question: string
  description?: string
  creatorAccountId: string
  escrowAccountId: string
  topicId: string
  topicUrl: string
  closeTime: string
  createdAt: string
  status: MarketStatus
  outcomes: string[]
  outcomeTokenIds: Record<string, string>
  outcomeTokenUrls: Record<string, string>
  resolvedOutcome?: string
  resolvedAt?: string
  resolvedByAccountId?: string
}

export interface MarketBet {
  id: string
  marketId: string
  bettorAccountId: string
  outcome: string
  amountHbar: number
  placedAt: string
  escrowTransactionId?: string
  escrowTransactionUrl?: string
  topicTransactionId?: string
  topicSequenceNumber?: number
}

export interface MarketOrder {
  id: string
  marketId: string
  accountId: string
  outcome: string
  side: 'BID' | 'ASK'
  quantity: number
  price: number
  createdAt: string
  status: 'OPEN' | 'CANCELLED'
  topicTransactionId?: string
  topicTransactionUrl?: string
}

export interface OrderBookSnapshot {
  marketId: string
  orders: MarketOrder[]
  bids: MarketOrder[]
  asks: MarketOrder[]
}

// Mirror of packages/agents/src/agent.ts (as returned by API)
export interface Agent {
  id: string
  name: string
  accountId: string
  bankrollHbar: number
  reputationScore: number
  strategy: string
}

// Mirror of packages/reputation/src/types.ts
export interface ReputationLeaderboardEntry {
  accountId: string
  score: number
  attestationCount: number
}

export interface TrustEdge {
  from: string
  to: string
  weight: number
  attestations: number
}

export interface TrustGraph {
  nodes: string[]
  edges: TrustEdge[]
  adjacency: Record<string, TrustEdge[]>
}

// Autonomy engine status
export interface AutonomyStatus {
  enabled: boolean
  running: boolean
  tickCount?: number
  agentCount?: number
  reason?: string
}

// WebSocket event shape
export interface WsEvent<T = unknown> {
  type: string
  payload: T
  timestamp: string
}
