import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useTradeStore } from '../store/tradeStore'
import { formatCurrency } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { createStyledExport } from '../lib/exportImage'
import { useRef } from 'react'
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
  const monthlyPanelRef = useRef<HTMLDivElement | null>(null)
  
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
    <div className="space-y-8 max-w-7xl mx-auto px-4" ref={monthlyPanelRef}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Trading Calendar
        </h1>
        <p className="text-xl text-muted-foreground">
          {currentMonth.year} - {currentMonth.month.toString().padStart(2, '0')}
        </p>
        
        {/* Month Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Wins</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {currentMonthTrades.filter(t => t.result === 'Win').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Losses</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {currentMonthTrades.filter(t => t.result === 'Loss').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {currentMonthTrades.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Button */}
        <div className="flex justify-center">
          <Button
            onClick={async () => {
              const exportData = {
                title: 'Trading Calendar',
                subtitle: `${currentMonth.year} - ${currentMonth.month.toString().padStart(2, '0')}`,
                data: currentMonthTrades,
                type: 'calendar' as const
              }
              
              await createStyledExport(exportData, {
                fileName: `calendar-${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}.png`,
                scale: 3,
                quality: 1.0
              })
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Export as Image
          </Button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              Monthly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center p-2 font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="h-24" />
                }

                const dateString = formatDateString(day)
                const dayTrades = getTradesByDate(dateString)
                const dailySummary = getDailySummary(dateString)
                const isSelected = selectedDate === dateString
                const isHovered = hoveredDate === dateString

                return (
                  <motion.div
                    key={index}
                    className={`
                      h-24 border rounded-lg p-1 cursor-pointer transition-all duration-200
                      ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''}
                      ${isHovered ? 'shadow-lg' : 'hover:shadow-md'}
                                             ${dayTrades.length > 0 ? 'bg-gradient-to-br ' + getResultGradient(dailySummary.result) : 'bg-card hover:bg-muted/50'}
                    `}
                    onClick={() => setSelectedDate(dateString)}
                    onMouseEnter={() => setHoveredDate(dateString)}
                    onMouseLeave={() => setHoveredDate(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-right text-sm font-medium mb-1">
                      {day}
                    </div>
                    
                    {dayTrades.length > 0 && (
                      <div className="space-y-1">
                                                 <div className="text-xs font-bold text-center">
                           {formatCurrency(dailySummary.totalPL)}
                         </div>
                         <div className="text-xs text-center opacity-80">
                           {dayTrades.length} trade{dayTrades.length !== 1 ? 's' : ''}
                         </div>
                         {dailySummary.result && (
                           <div className={`
                             text-xs text-center px-1 py-0.5 rounded-full font-medium
                             ${getResultColor(dailySummary.result)} bg-opacity-20
                           `}>
                             {dailySummary.result}
                           </div>
                         )}
                      </div>
                    )}
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