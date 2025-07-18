"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorHandler } from "@/lib/error-handler"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarData {
  [day: number]: {
    profit: number
    trades: number
    win: boolean
  }
}

export function CalendarView() {
  const { isAuthenticated } = useAuth()
  const [calendarData, setCalendarData] = useState<CalendarData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1 // API expects 1-based month
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // Get number of days in current month
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Convert to Monday = 0

  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const data = await apiService.getCalendarData(year, month)
        
        // Transform the data to match our interface
        const transformedData: CalendarData = {}
        data.forEach((dayData: any) => {
          const day = new Date(dayData.date).getDate()
          transformedData[day] = {
            profit: dayData.profit || 0,
            trades: dayData.trades || 0,
            win: dayData.profit > 0
          }
        })
        
        setCalendarData(transformedData)
      } catch (error: any) {
        const result = ErrorHandler.handle(error, {
          action: 'fetch calendar data',
          component: 'CalendarView'
        })
        setError(result.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalendarData()
  }, [isAuthenticated, year, month])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{monthName}</CardTitle>
          <CardDescription>Trading calendar view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please log in to view your trading calendar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{monthName}</CardTitle>
            <CardDescription>Trading calendar view</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {/* Empty cells for alignment */}
            {Array.from({ length: startDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-14 rounded-md border border-dashed"></div>
            ))}
            {days.map((day) => {
              const dayData = calendarData[day]
              return (
                <div
                  key={day}
                  className={cn(
                    "flex h-14 flex-col rounded-md border p-1",
                    dayData && dayData.win
                      ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                      : dayData && !dayData.win && dayData.trades > 0
                        ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                        : "",
                  )}
                >
                  <div className="text-xs">{day}</div>
                  {dayData && dayData.trades > 0 && (
                    <>
                      <div
                        className={cn(
                          "mt-auto text-xs font-medium",
                          dayData.win ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                        )}
                      >
                        {dayData.profit > 0 ? "+" : ""}${Math.abs(dayData.profit).toFixed(0)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {dayData.trades} trade{dayData.trades > 1 ? "s" : ""}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
