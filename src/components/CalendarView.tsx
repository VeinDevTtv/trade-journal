import React from 'react'
import { useTradeStore } from '../store/tradeStore'
import { formatCurrency } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function CalendarView() {
  const { getCurrentMonthTrades, getTradeByDate, currentMonth } = useTradeStore()
  const trades = getCurrentMonthTrades()

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

  const formatDateString = (day: number) => {
    return `${currentMonth.year}-${currentMonth.month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win': return 'bg-green-100 border-green-200 text-green-800'
      case 'Loss': return 'bg-red-100 border-red-200 text-red-800'
      default: return 'bg-yellow-100 border-yellow-200 text-yellow-800'
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Trading Calendar</h2>
      
      <Card>
        <CardContent className="p-6">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-2 text-center font-medium text-muted-foreground border-b"
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
              const trade = getTradeByDate(dateString)
              const isToday = new Date().toDateString() === new Date(dateString).toDateString()

              return (
                <div
                  key={day}
                  className={`aspect-square p-1 border border-border ${
                    isToday ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="h-full flex flex-col">
                    {/* Day number */}
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-primary' : ''
                    }`}>
                      {day}
                    </div>
                    
                    {/* Trade info */}
                    {trade ? (
                      <div className={`text-xs p-1 rounded border ${getResultColor(trade.result)}`}>
                        <div className="font-medium truncate">{trade.pair}</div>
                        <div>{formatCurrency(trade.profitLoss)}</div>
                        <div>R:R {trade.riskReward}</div>
                        <div className="truncate">{trade.account}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground p-1 bg-muted/30 rounded">
                        <div>No Trade</div>
                        <div>$0</div>
                        <div>RR: 0</div>
                        <div>Breakeven</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Trading Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trades.length} / {daysInMonth}
            </div>
            <div className="text-sm text-muted-foreground">
              Days traded this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Best Day</CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(Math.max(...trades.map(t => t.profitLoss)))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Highest single day profit
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No trades yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Worst Day</CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(Math.min(...trades.map(t => t.profitLoss)))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Largest single day loss
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No trades yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 