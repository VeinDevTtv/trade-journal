export interface Trade {
  id: string
  pair: string
  date: string
  time?: string // Format: HH:mm (24-hour format)
  direction: 'Long' | 'Short' | '-'
  profitLoss: number
  result: 'Win' | 'Loss' | 'Breakeven'
  riskReward: number
  account: 'Funded' | 'Demo' | 'Personal'
  emotions: string
  tags?: string[]
  // Optional metadata
  source?: string
  externalId?: string
  brokerAccount?: string
  openTime?: string // ISO timestamp
  closeTime?: string // ISO timestamp
}

export interface TradeMonth {
  year: number
  month: number
  trades: Trade[]
}

export interface TradeSummary {
  totalProfitLoss: number
  totalRiskReward: number
  winRate: number
  totalTrades: number
}

export interface Goal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  priority: 'Low' | 'Medium' | 'High'
  profitAllocationPercentage: number // What percentage of profit goes to this goal
  status: 'Active' | 'Completed' | 'Paused'
  createdAt: string
  updatedAt: string
  completedAt?: string
  category?: string // Optional categorization like 'Emergency Fund', 'Investment', 'Purchase', etc.
  notes?: string
}

export interface GoalSummary {
  totalTargetAmount: number
  totalCurrentAmount: number
  totalProgressPercentage: number
  totalActiveGoals: number
  totalCompletedGoals: number
  totalProfitAllocated: number
} 