import React from 'react'
import { useTradeStore } from '../store/tradeStore'
import { formatCurrency } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react'

export function TradingInsights() {
  const { getCurrentMonthTrades } = useTradeStore()
  const trades = getCurrentMonthTrades()

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trading Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Add some trades to see insights and analytics.</p>
        </CardContent>
      </Card>
    )
  }

  const wins = trades.filter(t => t.result === 'Win')
  const losses = trades.filter(t => t.result === 'Loss')
  const breakevens = trades.filter(t => t.result === 'Breakeven')
  
  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.profitLoss, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.profitLoss, 0) / losses.length : 0
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0

  const mostTradedPairs = trades.reduce((acc, trade) => {
    if (trade.pair) {
      acc[trade.pair] = (acc[trade.pair] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const topPair = Object.entries(mostTradedPairs).sort((a, b) => b[1] - a[1])[0]
  
  const bestTrade = trades.reduce((best, current) => 
    current.profitLoss > best.profitLoss ? current : best, trades[0])
  
  const worstTrade = trades.reduce((worst, current) => 
    current.profitLoss < worst.profitLoss ? current : worst, trades[0])

  const longTrades = trades.filter(t => t.direction === 'Long')
  const shortTrades = trades.filter(t => t.direction === 'Short')
  
  const longWinRate = longTrades.length > 0 ? 
    (longTrades.filter(t => t.result === 'Win').length / longTrades.length) * 100 : 0
  const shortWinRate = shortTrades.length > 0 ? 
    (shortTrades.filter(t => t.result === 'Win').length / shortTrades.length) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Trading Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(avgWin)}
            </div>
            <div className="text-sm text-muted-foreground">Average Win</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(avgLoss)}
            </div>
            <div className="text-sm text-muted-foreground">Average Loss</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">
              {profitFactor.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Profit Factor</div>
          </div>
        </div>

        {/* Trade Direction Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium">Long Trades</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {longTrades.length} trades • {longWinRate.toFixed(1)}% win rate
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="font-medium">Short Trades</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {shortTrades.length} trades • {shortWinRate.toFixed(1)}% win rate
            </div>
          </div>
        </div>

        {/* Best & Worst Trades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="font-medium">Best Trade</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(bestTrade.profitLoss)}
            </div>
            <div className="text-sm text-muted-foreground">
              {bestTrade.pair} • {bestTrade.date}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-red-600" />
              <span className="font-medium">Worst Trade</span>
            </div>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(worstTrade.profitLoss)}
            </div>
            <div className="text-sm text-muted-foreground">
              {worstTrade.pair} • {worstTrade.date}
            </div>
          </div>
        </div>

        {/* Most Traded Pair */}
        {topPair && (
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <div className="font-medium">Most Traded Pair</div>
            <div className="text-lg font-bold">{topPair[0]}</div>
            <div className="text-sm text-muted-foreground">
              {topPair[1]} trades ({((topPair[1] / trades.length) * 100).toFixed(1)}% of all trades)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 