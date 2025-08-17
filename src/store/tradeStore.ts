import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Trade, TradeSummary, Goal, GoalSummary } from '../types/trade'

interface TradeStore {
  trades: Trade[]
  goals: Goal[]
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
  // Goals management
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  getGoals: () => Goal[]
  getGoalSummary: () => GoalSummary
  allocateProfitToGoals: (profitAmount: number) => void
  getGoalById: (id: string) => Goal | undefined
}

const generateId = () => Math.random().toString(36).substring(2, 15)

// Initial empty state - users will add their own real trades
const initialTrades: Trade[] = []
const initialGoals: Goal[] = []

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      trades: initialTrades,
      goals: initialGoals,
      currentMonth: { 
        year: new Date().getFullYear(), 
        month: new Date().getMonth() + 1 
      },
      
      addTrade: (trade: Omit<Trade, 'id'>) => {
        const newTrade = { ...trade, id: generateId() }
        set((state: TradeStore) => ({
          trades: [...state.trades, newTrade]
        }))
        
        // Automatically allocate profits to goals if the trade is profitable
        if (newTrade.profitLoss > 0) {
          get().allocateProfitToGoals(newTrade.profitLoss)
        }
      },
      
      updateTrade: (id: string, updatedFields: Partial<Trade>) => {
        const currentState = get()
        const existingTrade = currentState.trades.find(t => t.id === id)
        const oldProfitLoss = existingTrade?.profitLoss || 0
        
        set((state: TradeStore) => ({
          trades: state.trades.map((trade: Trade) => 
            trade.id === id ? { ...trade, ...updatedFields } : trade
          )
        }))
        
        // Handle profit allocation for updated profit/loss
        if (updatedFields.profitLoss !== undefined) {
          const newProfitLoss = updatedFields.profitLoss
          const profitDifference = newProfitLoss - oldProfitLoss
          
          if (profitDifference > 0) {
            get().allocateProfitToGoals(profitDifference)
          }
        }
      },
      
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
      },

      // Goals management methods
      addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString()
        const newGoal: Goal = { 
          ...goal, 
          id: generateId(),
          createdAt: now,
          updatedAt: now
        }
        set((state: TradeStore) => ({
          goals: [...state.goals, newGoal]
        }))
      },

      updateGoal: (id: string, updatedFields: Partial<Goal>) => {
        const now = new Date().toISOString()
        set((state: TradeStore) => ({
          goals: state.goals.map((goal: Goal) => 
            goal.id === id ? { ...goal, ...updatedFields, updatedAt: now } : goal
          )
        }))
      },

      deleteGoal: (id: string) => set((state: TradeStore) => ({
        goals: state.goals.filter((goal: Goal) => goal.id !== id)
      })),

      getGoals: () => get().goals,

      getGoalById: (id: string) => {
        const { goals } = get()
        return goals.find(goal => goal.id === id)
      },

      getGoalSummary: (): GoalSummary => {
        const { goals } = get()
        const activeGoals = goals.filter(goal => goal.status === 'Active')
        const completedGoals = goals.filter(goal => goal.status === 'Completed')
        
        const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
        const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
        const totalProgressPercentage = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
        const totalProfitAllocated = activeGoals.reduce((sum, goal) => sum + goal.profitAllocationPercentage, 0)

        return {
          totalTargetAmount,
          totalCurrentAmount,
          totalProgressPercentage,
          totalActiveGoals: activeGoals.length,
          totalCompletedGoals: completedGoals.length,
          totalProfitAllocated
        }
      },

      allocateProfitToGoals: (profitAmount: number) => {
        if (profitAmount <= 0) return
        
        set((state: TradeStore) => ({
          goals: state.goals.map((goal: Goal) => {
            if (goal.status !== 'Active') return goal
            
            const allocation = (goal.profitAllocationPercentage / 100) * profitAmount
            const newCurrentAmount = goal.currentAmount + allocation
            const isCompleted = newCurrentAmount >= goal.targetAmount
            
            return {
              ...goal,
              currentAmount: newCurrentAmount,
              status: isCompleted ? 'Completed' as const : goal.status,
              completedAt: isCompleted ? new Date().toISOString() : goal.completedAt,
              updatedAt: new Date().toISOString()
            }
          })
        }))
      }
    }),
    {
      name: 'trade-journal-storage',
    }
  )
) 