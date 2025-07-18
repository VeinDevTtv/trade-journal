export interface Trade {
  id: string
  pair: string
  date: string
  direction: 'Long' | 'Short' | '-'
  profitLoss: number
  result: 'Win' | 'Loss' | 'Breakeven'
  riskReward: number
  account: 'Funded' | 'Demo' | 'Personal'
  emotions: string
  tags?: string[]
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