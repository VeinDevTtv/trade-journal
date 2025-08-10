import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTradeStore } from '../store/tradeStore'
import { formatCurrency } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { TradeLockerSync } from './TradeLockerSync'
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

export function DashboardView() {
  const { trades: allTrades, currentMonth } = useTradeStore()
  
  // Calculate current month trades reactively
  const trades = useMemo(() => {
    return allTrades.filter(trade => {
      const tradeDate = new Date(trade.date)
      return tradeDate.getFullYear() === currentMonth.year &&
             tradeDate.getMonth() + 1 === currentMonth.month
    })
  }, [allTrades, currentMonth])
  
  // Calculate summary reactively
  const summary = useMemo(() => {
    const totalProfitLoss = trades.reduce((sum, trade) => sum + trade.profitLoss, 0)
    const totalRiskReward = trades.reduce((sum, trade) => sum + trade.riskReward, 0)
    const winningTrades = trades.filter(trade => trade.result === 'Win').length
    const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0
    
    return {
      totalProfitLoss,
      totalRiskReward,
      winRate,
      totalTrades: trades.length
    }
  }, [trades])

  // Calculate advanced metrics
  const analytics = useMemo(() => {
    if (trades.length === 0) {
      return {
        wins: 0,
        losses: 0,
        breakevens: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        tradingDays: 0,
        dailyPnL: [],
        pairPerformance: [],
        cumulativePnL: [],
        timeDistribution: []
      }
    }

    const wins = trades.filter(t => t.result === 'Win')
    const losses = trades.filter(t => t.result === 'Loss')
    const breakevens = trades.filter(t => t.result === 'Breakeven')

    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.profitLoss, 0) / wins.length : 0
    const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.profitLoss, 0) / losses.length : 0
    const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0

    const largestWin = Math.max(...trades.map(t => t.profitLoss), 0)
    const largestLoss = Math.min(...trades.map(t => t.profitLoss), 0)

    // Calculate consecutive wins/losses
    let consecutiveWins = 0
    let consecutiveLosses = 0
    let currentWinStreak = 0
    let currentLossStreak = 0

    trades.forEach(trade => {
      if (trade.result === 'Win') {
        currentWinStreak++
        currentLossStreak = 0
        consecutiveWins = Math.max(consecutiveWins, currentWinStreak)
      } else if (trade.result === 'Loss') {
        currentLossStreak++
        currentWinStreak = 0
        consecutiveLosses = Math.max(consecutiveLosses, currentLossStreak)
      }
    })

    // Daily P&L chart data
    const dailyPnL = trades.reduce((acc, trade) => {
      const date = trade.date
      const existing = acc.find(item => item.date === date)
      if (existing) {
        existing.pnl += trade.profitLoss
        existing.trades += 1
      } else {
        acc.push({
          date,
          pnl: trade.profitLoss,
          trades: 1,
          day: new Date(date).getDate()
        })
      }
      return acc
    }, [] as Array<{date: string, pnl: number, trades: number, day: number}>)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Cumulative P&L
    let cumulativeSum = 0
    const cumulativePnL = dailyPnL.map(item => {
      cumulativeSum += item.pnl
      return {
        ...item,
        cumulative: cumulativeSum
      }
    })

    // Pair performance
    const pairPerformance = Object.entries(
      trades.reduce((acc, trade) => {
        if (!trade.pair) return acc
        if (!acc[trade.pair]) {
          acc[trade.pair] = { wins: 0, losses: 0, totalPnL: 0, trades: 0 }
        }
        acc[trade.pair].totalPnL += trade.profitLoss
        acc[trade.pair].trades += 1
        if (trade.result === 'Win') acc[trade.pair].wins += 1
        if (trade.result === 'Loss') acc[trade.pair].losses += 1
        return acc
      }, {} as Record<string, {wins: number, losses: number, totalPnL: number, trades: number}>)
    ).map(([pair, data]) => ({
      pair,
      ...data,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0
    })).sort((a, b) => b.totalPnL - a.totalPnL)

    // Time distribution based on actual trade times
    const getSessionFromTime = (timeStr?: string) => {
      if (!timeStr) return 'Unknown'
      const [hours] = timeStr.split(':').map(Number)
      
      // Trading sessions based on UTC hours
      if (hours >= 0 && hours < 8) return 'Asia'
      if (hours >= 8 && hours < 16) return 'London' 
      if (hours >= 16 && hours < 24) return 'New York'
      return 'Unknown'
    }
    
    const timeDistribution = [
      { time: 'Asia', trades: trades.filter(t => getSessionFromTime(t.time) === 'Asia').length },
      { time: 'London', trades: trades.filter(t => getSessionFromTime(t.time) === 'London').length },
      { time: 'New York', trades: trades.filter(t => getSessionFromTime(t.time) === 'New York').length },
      { time: 'Unknown', trades: trades.filter(t => getSessionFromTime(t.time) === 'Unknown').length }
    ].filter(item => item.trades > 0) // Only show sessions with trades

    return {
      wins: wins.length,
      losses: losses.length,
      breakevens: breakevens.length,
      avgWin,
      avgLoss,
      profitFactor,
      largestWin,
      largestLoss,
      consecutiveWins,
      consecutiveLosses,
      tradingDays: new Set(trades.map(t => t.date)).size,
      dailyPnL,
      pairPerformance,
      cumulativePnL,
      timeDistribution
    }
  }, [trades])

  const statsCards = [
    {
      title: "Total P&L",
      value: formatCurrency(summary.totalProfitLoss),
      change: trades.length > 0 ? (summary.totalProfitLoss >= 0 ? "Profit" : "Loss") : "No trades yet",
      icon: DollarSign,
      color: summary.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Win Rate",
      value: `${summary.winRate.toFixed(1)}%`,
      change: trades.length > 0 ? `${trades.length} trades` : "No data",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Total Trades",
      value: summary.totalTrades.toString(),
      change: `${analytics.tradingDays} days`,
      icon: Activity,
      color: "text-purple-600"
    },
    {
      title: "Profit Factor",
      value: analytics.profitFactor.toFixed(2),
      change: analytics.profitFactor > 1 ? "Profitable" : "Improve",
      icon: TrendingUp,
      color: analytics.profitFactor > 1 ? "text-green-600" : "text-orange-600"
    }
  ]

  const pieData = [
    { name: 'Wins', value: analytics.wins, color: '#10b981' },
    { name: 'Losses', value: analytics.losses, color: '#ef4444' },
    { name: 'Breakeven', value: analytics.breakevens, color: '#f59e0b' }
  ].filter(item => item.value > 0)

  return (
    <div className="space-y-8">
      <TradeLockerSync />
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br from-${stat.color.split('-')[1]}-100 to-${stat.color.split('-')[1]}-50`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative P&L Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cumulative P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {analytics.cumulativePnL.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.cumulativePnL}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        fontSize={12}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Cumulative P&L']}
                        labelFormatter={(label) => `Day ${label}`}
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f9fafb'
                        }}
                      />
                      <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="cumulative" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fill="url(#colorPnL)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No trading data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trade Results Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Trade Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [value, name]}
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f9fafb'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No trades to display
                  </div>
                )}
              </div>
              
              {/* Legend */}
              {pieData.length > 0 && (
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily P&L and Pair Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily P&L Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily P&L Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {analytics.dailyPnL.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dailyPnL}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'P&L']}
                        labelFormatter={(label) => `Day ${label}`}
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f9fafb'
                        }}
                      />
                      <Bar 
                        dataKey="pnl" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No daily data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pair Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Pairs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.pairPerformance.slice(0, 5).map((pair) => (
                  <div key={pair.pair} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{pair.pair || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {pair.trades} trades • {pair.winRate.toFixed(0)}% win rate
                      </p>
                    </div>
                    <div className={`text-right ${pair.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <p className="font-bold">{formatCurrency(pair.totalPnL)}</p>
                    </div>
                  </div>
                ))}
                {analytics.pairPerformance.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No pair data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Advanced Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Advanced Trading Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.avgWin)}</p>
                <p className="text-sm text-muted-foreground">Average Win</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.avgLoss)}</p>
                <p className="text-sm text-muted-foreground">Average Loss</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{analytics.consecutiveWins}</p>
                <p className="text-sm text-muted-foreground">Max Win Streak</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.largestWin)}</p>
                <p className="text-sm text-muted-foreground">Best Trade</p>
              </div>
            </div>

            {/* Profitability Checklist */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Profitability Checklist</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  Followed a written plan before entering each trade
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  Risk per trade ≤ 1% and documented R:R
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  Took only A+ setups during your active session
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  Logged emotions and lesson per trade
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  Stopped trading after daily max loss hit
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 