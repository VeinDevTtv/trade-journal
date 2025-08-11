import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useTradeStore } from '../store/tradeStore'
import { formatCurrency, formatLocalYMD } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown,
  Award,
  Activity,
  Plus,
  Eye,
  DollarSign
} from 'lucide-react'

export function CalendarView() {
  const { trades, currentMonth, addTrade, getTradesByDate, getDailyTradeSummary } = useTradeStore()
  
  // Calculate current month trades reactively
  const currentMonthTrades = useMemo(() => {
    return trades.filter(trade => {
      // Compare via string Y-M-D to avoid timezone shifts
      const [y, m] = (trade.date || '').split('-')
      return Number(y) === currentMonth.year && Number(m) === currentMonth.month
    })
  }, [trades, currentMonth])
  
  // Get daily trade summary reactively
  const getDailySummary = (date: string) => {
    return getDailyTradeSummary(date)
  }
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  // Get the first day of the month and how many days in the month
  const firstDayOfMonth = new Date(currentMonth.year, currentMonth.month - 1, 1)
  const lastDayOfMonth = new Date(currentMonth.year, currentMonth.month, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday

  // Create array of days for the calendar
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const formatDateString = (day: number) => `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const getResultColor = (result: string, isBackground = false) => {
    const prefix = isBackground ? 'bg' : 'text'
    switch (result) {
      case 'Win': return `${prefix}-green-600`
      case 'Loss': return `${prefix}-red-600`
      default: return `${prefix}-yellow-600`
    }
  }

  const getResultBorderColor = (result: string) => {
    switch (result) {
      case 'Win': return 'border-green-200 dark:border-green-800'
      case 'Loss': return 'border-red-200 dark:border-red-800'
      default: return 'border-yellow-200 dark:border-yellow-800'
    }
  }

  const getResultGradient = (result: string) => {
    switch (result) {
      case 'Win': return 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20'
      case 'Loss': return 'from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20'
      default: return 'from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20'
    }
  }

  const addTradeForDate = (date: string) => {
    const newTrade = {
      pair: '',
      date,
      time: '',
      direction: '-' as const,
      profitLoss: 0,
      result: 'Breakeven' as const,
      riskReward: 0,
      account: 'Demo' as const,
      emotions: ''
    }
    addTrade(newTrade)
    toast.success(`New trade added for ${new Date(date).toLocaleDateString()}`)
    
    // Update the selected date to show the new trade immediately
    setSelectedDate(date)
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Calculate additional metrics with proper daily aggregation
  const tradingDays = new Set(currentMonthTrades.map(t => t.date)).size
  const uniqueDates = [...new Set(currentMonthTrades.map(t => t.date))]
  
  const dailyPnLs = uniqueDates.map(date => getDailyTradeSummary(date).totalPL)
  const totalPnL = dailyPnLs.reduce((sum, dayPnL) => sum + dayPnL, 0)
  const bestDay = dailyPnLs.length > 0 ? Math.max(...dailyPnLs) : 0
  const worstDay = dailyPnLs.length > 0 ? Math.min(...dailyPnLs) : 0
  const avgDailyPnL = dailyPnLs.length > 0 ? totalPnL / dailyPnLs.length : 0
  
  const winningDays = uniqueDates.filter(date => getDailyTradeSummary(date).result === 'Win').length
  const losingDays = uniqueDates.filter(date => getDailyTradeSummary(date).result === 'Loss').length

  const selectedDayTrades = selectedDate ? getTradesByDate(selectedDate) : []
  const selectedDaySummary = selectedDate ? getDailySummary(selectedDate) : null

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Trading Calendar</h2>
            <p className="text-muted-foreground">Visual overview of your daily trading performance</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Profitable Days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Loss Days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Breakeven</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="xl:col-span-3"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {currentMonth.year} - {['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'][currentMonth.month - 1]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Week day headers */}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center font-semibold text-muted-foreground border-b-2 border-muted"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="aspect-square p-1"></div>
                  }

                  const dateString = formatDateString(day)
                  const dailySummary = getDailySummary(dateString)
                  const hasTrades = dailySummary.tradeCount > 0
                  const isToday = formatLocalYMD(new Date()) === dateString
                  const isSelected = selectedDate === dateString
                  const isHovered = hoveredDate === dateString

                  return (
                    <motion.div
                      key={day}
                      className={`
                        aspect-square p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden
                        ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                        ${isSelected ? 'scale-105 shadow-lg' : ''}
                        ${isHovered ? 'scale-[1.02] shadow-md' : ''}
                        ${hasTrades ? getResultBorderColor(dailySummary.result) : 'border-muted'}
                      `}
                      onClick={() => setSelectedDate(dateString)}
                      onMouseEnter={() => setHoveredDate(dateString)}
                      onMouseLeave={() => setHoveredDate(null)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="h-full flex flex-col">
                        {/* Day number */}
                        <div className={`text-sm font-bold mb-1 ${
                          isToday ? 'text-primary' : ''
                        }`}>
                          {day}
                        </div>
                        
                        {/* Trade info */}
                        {hasTrades ? (
                          <div className={`
                            text-xs p-2 rounded-md border-2 flex-1 flex flex-col justify-between overflow-hidden break-words
                            bg-gradient-to-br ${getResultGradient(dailySummary.result)}
                            ${getResultBorderColor(dailySummary.result)}
                          `}>
                            <div className="space-y-1">
                              <div className="font-semibold truncate">
                                {dailySummary.pairs.length > 0 
                                  ? dailySummary.pairs.length > 1 
                                    ? `${dailySummary.pairs[0]} +${dailySummary.pairs.length - 1}`
                                    : dailySummary.pairs[0]
                                  : 'Multiple'
                                }
                              </div>
                              <div className={`font-bold ${getResultColor(dailySummary.result)}`}>
                                {formatCurrency(dailySummary.totalPL)}
                              </div>
                              {dailySummary.tradeCount > 1 && (
                                <div className="text-xs opacity-60">
                                  {dailySummary.tradeCount} trades
                                </div>
                              )}
                            </div>
                            <div className="text-xs opacity-75">
                              R:R {dailySummary.totalRR.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="text-xs p-2 bg-muted/20 rounded-md border-2 border-dashed border-muted flex-1 flex flex-col justify-center items-center group hover:bg-muted/40 transition-colors cursor-pointer overflow-hidden"
                            onClick={(e) => {
                              e.stopPropagation()
                              addTradeForDate(dateString)
                            }}
                          >
                            <div className="opacity-50 group-hover:opacity-75 transition-opacity">
                              <Plus className="h-4 w-4 mb-1" />
                              <div>Add Trade</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Panel - Trade Details or Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Selected Trade Details */}
          <AnimatePresence mode="wait">
            {selectedDate && (
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Eye className="h-4 w-4" />
                      {new Date(selectedDate).toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDayTrades.length > 0 ? (
                      <div className="space-y-4">
                        {/* Daily Summary */}
                        <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-3 rounded-lg">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Total P&L</p>
                              <p className={`font-bold text-lg ${getResultColor(selectedDaySummary?.result || 'Breakeven')}`}>
                                {formatCurrency(selectedDaySummary?.totalPL || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total R:R</p>
                              <p className="font-semibold">{selectedDaySummary?.totalRR.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Trades</p>
                              <p className="font-semibold">{selectedDaySummary?.tradeCount || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Pairs</p>
                              <p className="font-semibold text-xs">
                                {selectedDaySummary?.pairs.join(', ') || 'None'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Individual Trades */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Individual Trades:</p>
                          {selectedDayTrades.map((trade, index) => (
                            <div key={trade.id} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">Trade #{index + 1}</span>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResultColor(trade.result)} bg-gradient-to-r ${getResultGradient(trade.result)}`}>
                                  {trade.result}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Pair:</span> {trade.pair || 'N/A'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Direction:</span>
                                  {trade.direction === 'Long' && <TrendingUp className="h-3 w-3 text-green-600" />}
                                  {trade.direction === 'Short' && <TrendingDown className="h-3 w-3 text-red-600" />}
                                  {trade.direction}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">P&L:</span>
                                  <span className={`font-semibold ml-1 ${getResultColor(trade.result)}`}>
                                    {formatCurrency(trade.profitLoss)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">R:R:</span> {trade.riskReward}
                                </div>
                              </div>
                              {trade.emotions && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">Emotions:</span>
                                  <span className="italic ml-1">"{trade.emotions}"</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-muted-foreground mb-3">
                          <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No trade recorded</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => addTradeForDate(selectedDate)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Trade
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Monthly Stats Cards */}
          <div className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trading Days</p>
                    <p className="text-xl font-bold">{tradingDays}</p>
                    <p className="text-xs text-muted-foreground">
                      {((tradingDays / daysInMonth) * 100).toFixed(0)}% of month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Best Day</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(bestDay)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Single best trade
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Worst Day</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(worstDay)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Largest single loss
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Daily P&L</p>
                    <p className={`text-xl font-bold ${avgDailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(avgDailyPnL)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Per trading day
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Monthly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Calendar Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{winningDays}</div>
                <div className="text-sm text-muted-foreground">Winning Days</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {tradingDays > 0 ? ((winningDays / tradingDays) * 100).toFixed(0) : 0}% of trading days
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{losingDays}</div>
                <div className="text-sm text-muted-foreground">Losing Days</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {tradingDays > 0 ? ((losingDays / tradingDays) * 100).toFixed(0) : 0}% of trading days
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{tradingDays}</div>
                <div className="text-sm text-muted-foreground">Active Days</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {((tradingDays / daysInMonth) * 100).toFixed(0)}% of month
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalPnL)}
                </div>
                <div className="text-sm text-muted-foreground">Monthly P&L</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total performance
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 