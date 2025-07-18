import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { Trade, TradeSummary } from '../types/trade'

interface TradeStore {
  trades: Trade[]
  currentMonth: { year: number; month: number }
  addTrade: (trade: Omit<Trade, 'id'>) => void
  updateTrade: (id: string, trade: Partial<Trade>) => void
  deleteTrade: (id: string) => void
  setCurrentMonth: (year: number, month: number) => void
  getCurrentMonthTrades: () => Trade[]
  getTradeSummary: () => TradeSummary
  getTradeByDate: (date: string) => Trade | undefined
}

const generateId = () => Math.random().toString(36).substring(2, 15)

// Mock data for initial setup
const mockTrades: Trade[] = [
  {
    id: '1',
    pair: 'XAUUSD',
    date: '2024-01-15',
    direction: 'Long',
    profitLoss: 250.50,
    result: 'Win',
    riskReward: 2.5,
    account: 'Funded',
    emotions: 'Confident, followed the plan'
  },
  {
    id: '2',
    pair: 'US100',
    date: '2024-01-16',
    direction: 'Short',
    profitLoss: -100.00,
    result: 'Loss',
    riskReward: 1.8,
    account: 'Demo',
    emotions: 'FOMO entry, lesson learned'
  },
  {
    id: '3',
    pair: 'EURUSD',
    date: '2024-01-17',
    direction: 'Long',
    profitLoss: 0,
    result: 'Breakeven',
    riskReward: 0,
    account: 'Personal',
    emotions: 'Neutral, market was choppy'
  }
]

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      trades: mockTrades,
      currentMonth: { 
        year: new Date().getFullYear(), 
        month: new Date().getMonth() + 1 
      },
      
      addTrade: (trade: Omit<Trade, 'id'>) => set((state: TradeStore) => ({
        trades: [...state.trades, { ...trade, id: generateId() }]
      })),
      
      updateTrade: (id: string, updatedFields: Partial<Trade>) => set((state: TradeStore) => ({
        trades: state.trades.map((trade: Trade) => 
          trade.id === id ? { ...trade, ...updatedFields } : trade
        )
      })),
      
      deleteTrade: (id: string) => set((state: TradeStore) => ({
        trades: state.trades.filter((trade: Trade) => trade.id !== id)
      })),
      
      setCurrentMonth: (year, month) => set({ currentMonth: { year, month } }),
      
      getCurrentMonthTrades: () => {
        const { trades, currentMonth } = get()
        return trades.filter(trade => {
          const tradeDate = new Date(trade.date)
          return tradeDate.getFullYear() === currentMonth.year &&
                 tradeDate.getMonth() + 1 === currentMonth.month
        })
      },
      
      getTradeSummary: () => {
        const currentTrades = get().getCurrentMonthTrades()
        const totalProfitLoss = currentTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)
        const totalRiskReward = currentTrades.reduce((sum, trade) => sum + trade.riskReward, 0)
        const winningTrades = currentTrades.filter(trade => trade.result === 'Win').length
        const winRate = currentTrades.length > 0 ? (winningTrades / currentTrades.length) * 100 : 0
        
        return {
          totalProfitLoss,
          totalRiskReward,
          winRate,
          totalTrades: currentTrades.length
        }
      },
      
      getTradeByDate: (date: string) => {
        const trades = get().getCurrentMonthTrades()
        return trades.find(trade => trade.date === date)
      }
    }),
    {
      name: 'trade-journal-storage',
    }
  )
) 