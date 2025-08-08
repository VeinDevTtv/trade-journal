import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
  getTradesByDate: (date: string) => Trade[]
  getDailyTradeSummary: (date: string) => { totalPL: number; totalRR: number; pairs: string[]; tradeCount: number; result: 'Win' | 'Loss' | 'Breakeven' }
  // Integration helpers
  bulkUpsertTrades: (incoming: Omit<Trade, 'id'>[]) => { added: number; updated: number }
  findByExternalId: (externalId: string) => Trade | undefined
}

const generateId = () => Math.random().toString(36).substring(2, 15)

// Initial empty state - users will add their own real trades
const initialTrades: Trade[] = []

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      trades: initialTrades,
      currentMonth: { 
        year: new Date().getFullYear(), 
        month: new Date().getMonth() + 1 
      },
      
      addTrade: (trade: Omit<Trade, 'id'>) => {
        const newTrade = { ...trade, id: generateId() }
        set((state: TradeStore) => ({
          trades: [...state.trades, newTrade]
        }))
      },
      
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
      },

      getTradesByDate: (date: string) => {
        const trades = get().getCurrentMonthTrades()
        return trades.filter(trade => trade.date === date)
      },

      getDailyTradeSummary: (date: string) => {
        const dailyTrades = get().getTradesByDate(date)
        
        if (dailyTrades.length === 0) {
          return { totalPL: 0, totalRR: 0, pairs: [], tradeCount: 0, result: 'Breakeven' as const }
        }

        const totalPL = dailyTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)
        const totalRR = dailyTrades.reduce((sum, trade) => sum + trade.riskReward, 0)
        const pairs = [...new Set(dailyTrades.map(trade => trade.pair).filter(pair => pair && pair.trim() !== ''))]
        const tradeCount = dailyTrades.length

        // Determine overall daily result based on total P/L
        let result: 'Win' | 'Loss' | 'Breakeven'
        if (totalPL > 0) {
          result = 'Win'
        } else if (totalPL < 0) {
          result = 'Loss'
        } else {
          result = 'Breakeven'
        }

        return { totalPL, totalRR, pairs, tradeCount, result }
      },

      // Integration helpers
      findByExternalId: (externalId: string) => {
        const { trades } = get()
        return trades.find(t => t.externalId === externalId)
      },
      bulkUpsertTrades: (incoming: Omit<Trade, 'id'>[]) => {
        let added = 0
        let updated = 0
        set((state: TradeStore) => {
          const existingByExternal: Record<string, Trade> = {}
          state.trades.forEach(t => {
            if (t.externalId) existingByExternal[t.externalId] = t
          })
          const updatedTrades = [...state.trades]
          incoming.forEach(inTrade => {
            if (inTrade.externalId && existingByExternal[inTrade.externalId]) {
              const idx = updatedTrades.findIndex(t => t.externalId === inTrade.externalId)
              if (idx >= 0) {
                updatedTrades[idx] = { ...updatedTrades[idx], ...inTrade }
                updated++
              }
            } else {
              updatedTrades.push({ ...inTrade, id: generateId() })
              added++
            }
          })
          return { trades: updatedTrades }
        })
        return { added, updated }
      }
    }),
    {
      name: 'trade-journal-storage',
    }
  )
) 