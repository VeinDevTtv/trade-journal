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
  // Integration metadata
  source?: string // e.g., 'TradeLocker'
  externalId?: string // broker/exchange trade id for dedupe
  brokerAccount?: string // broker account identifier
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