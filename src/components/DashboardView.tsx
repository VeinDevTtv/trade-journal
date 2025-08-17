import { useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTradeStore } from '../store/tradeStore'
import { formatCurrency } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity,
  Award,
  BarChart3,
  PieChart,
  Zap,
  TrendingDown,
  Calendar,
  Clock
} from 'lucide-react'
import { createStyledExport } from '../lib/exportImage'
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
  const dashboardRef = useRef<HTMLDivElement | null>(null)
  
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
      } else {
        currentWinStreak = 0
        currentLossStreak = 0
      }
    })

    // Calculate trading days
    const uniqueDays = new Set(trades.map(t => new Date(t.date).toDateString()))
    const tradingDays = uniqueDays.size

    // Calculate daily P&L
    const dailyPnL = Array.from(uniqueDays).map(dayStr => {
      const dayTrades = trades.filter(t => new Date(t.date).toDateString() === dayStr)
      const dayPnL = dayTrades.reduce((sum, t) => sum + t.profitLoss, 0)
      return { day: new Date(dayStr).getDate(), pnl: dayPnL }
    }).sort((a, b) => a.day - b.day)

    // Calculate pair performance
    const pairMap = new Map()
    trades.forEach(trade => {
      const pair = trade.pair || 'Unknown'
      if (!pairMap.has(pair)) {
        pairMap.set(pair, { trades: 0, wins: 0, totalPnL: 0 })
      }
      const pairData = pairMap.get(pair)
      pairData.trades++
      pairData.totalPnL += trade.profitLoss
      if (trade.result === 'Win') pairData.wins++
    })

    const pairPerformance = Array.from(pairMap.entries()).map(([pair, data]: [string, any]) => ({
      pair,
      trades: data.trades,
      winRate: (data.wins / data.trades) * 100,
      totalPnL: data.totalPnL
    })).sort((a, b) => b.totalPnL - a.totalPnL)

    // Calculate cumulative P&L
    const cumulativePnL = dailyPnL.map((day, index) => {
      const cumulative = dailyPnL.slice(0, index + 1).reduce((sum, d) => sum + d.pnl, 0)
      return { day: day.day, cumulative }
    })

    // Calculate time distribution
    const timeDistribution = trades.reduce((acc, trade) => {
      const hour = new Date(trade.date).getHours()
      const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
      acc[timeSlot] = (acc[timeSlot] || 0) + 1
      return acc
    }, {} as Record<string, number>)

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
      tradingDays,
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
      color: summary.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600",
              variant: summary.totalProfitLoss >= 0 ? "success" : "destructive"
    },
    {
      title: "Win Rate",
      value: `${summary.winRate.toFixed(1)}%`,
      change: trades.length > 0 ? `${trades.length} trades` : "No data",
      icon: Target,
      color: "text-blue-600",
      variant: "info" as const
    },
    {
      title: "Total Trades",
      value: summary.totalTrades.toString(),
      change: `${analytics.tradingDays} days`,
      icon: Activity,
      color: "text-purple-600",
      variant: "secondary" as const
    },
    {
      title: "Profit Factor",
      value: analytics.profitFactor.toFixed(2),
      change: analytics.profitFactor > 1 ? "Profitable" : "Improve",
      icon: TrendingUp,
      color: analytics.profitFactor > 1 ? "text-green-600" : "text-orange-600",
      variant: analytics.profitFactor > 1 ? "success" : "warning" as const
    }
  ]

  const pieData = [
    { name: 'Wins', value: analytics.wins, color: '#10b981' },
    { name: 'Losses', value: analytics.losses, color: '#ef4444' },
    { name: 'Breakeven', value: analytics.breakevens, color: '#f59e0b' }
  ].filter(item => item.value > 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4" ref={dashboardRef}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Trading Dashboard
        </h1>
        <p className="text-xl text-muted-foreground">
          {currentMonth.year} - {currentMonth.month.toString().padStart(2, '0')}
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Calendar className="w-3 h-3 mr-1" />
            {analytics.tradingDays} Trading Days
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Clock className="w-3 h-3 mr-1" />
            {trades.length} Total Trades
          </Badge>
        </div>
      </motion.div>

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
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 group">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br from-${stat.color.split('-')[1]}-100 to-${stat.color.split('-')[1]}-50 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <Badge variant={stat.variant as any} className="text-xs">
                        {stat.change}
                      </Badge>
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
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
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
                          borderRadius: '12px',
                          color: '#f9fafb',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
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
                        strokeWidth={3}
                        fill="url(#colorPnL)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                    <div className="space-y-2">
                      <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
                      <p>No trading data available</p>
                    </div>
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
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <PieChart className="h-6 w-6 text-purple-600" />
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
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={8}
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
                          borderRadius: '12px',
                          color: '#f9fafb',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                    <div className="space-y-2">
                      <PieChart className="h-12 w-12 mx-auto opacity-50" />
                      <p>No trades to display</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Legend */}
              {pieData.length > 0 && (
                <div className="flex justify-center gap-6 mt-6">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-muted-foreground">
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
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
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
                          borderRadius: '12px',
                          color: '#f9fafb',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="pnl" 
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                    <div className="space-y-2">
                      <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
                      <p>No daily data available</p>
                    </div>
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
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Award className="h-6 w-6 text-yellow-600" />
                Top Pairs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.pairPerformance.slice(0, 5).map((pair, index) => (
                  <div key={pair.pair} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{pair.pair || 'Unknown'}</span>
                      </div>
                      <div className={`text-right font-bold ${pair.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(pair.totalPnL)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{pair.trades} trades</span>
                      <span>{pair.winRate.toFixed(0)}% win rate</span>
                    </div>
                    <Progress value={pair.winRate} className="h-2" />
                  </div>
                ))}
                {analytics.pairPerformance.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto opacity-50 mb-2" />
                    <p className="text-muted-foreground">No pair data available</p>
                  </div>
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
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              Advanced Trading Metrics
              <button
                className="ml-auto text-sm underline text-primary hover:text-primary/80 transition-colors duration-200"
                onClick={async () => {
                  const exportData = {
                    title: 'Trading Dashboard',
                    subtitle: `${currentMonth.year} - ${currentMonth.month.toString().padStart(2, '0')}`,
                    data: {
                      totalProfitLoss: summary.totalProfitLoss,
                      winRate: summary.winRate,
                      totalTrades: summary.totalTrades,
                      avgTrade: summary.totalTrades > 0 ? summary.totalProfitLoss / summary.totalTrades : 0
                    },
                    type: 'dashboard' as const
                  }
                  
                  await createStyledExport(exportData, {
                    fileName: `dashboard-${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}.png`,
                    scale: 3,
                    quality: 1.0
                  })
                }}
              >
                Export as Image
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800/30">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.avgWin)}</p>
                <p className="text-sm text-muted-foreground">Average Win</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800/30">
                <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.avgLoss)}</p>
                <p className="text-sm text-muted-foreground">Average Loss</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{analytics.consecutiveWins}</p>
                <p className="text-sm text-muted-foreground">Max Win Streak</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800/30">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.largestWin)}</p>
                <p className="text-sm text-muted-foreground">Best Trade</p>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Profitability Checklist */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6 text-center">Profitability Checklist</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <span className="text-sm text-left">Followed a written plan before entering each trade</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <span className="text-sm text-left">Risk per trade ≤ 1% and documented R:R</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <span className="text-sm text-left">Took only A+ setups during your active session</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <span className="text-sm text-left">Logged emotions and lesson per trade</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <span className="text-sm text-left">Stopped trading after daily max loss hit</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 