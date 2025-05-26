"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function CalendarView() {
  // Sample data for the calendar
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const tradeData = {
    1: { profit: 120, trades: 2, win: true },
    3: { profit: -80, trades: 1, win: false },
    5: { profit: 250, trades: 3, win: true },
    8: { profit: 180, trades: 2, win: true },
    10: { profit: -150, trades: 2, win: false },
    12: { profit: 320, trades: 4, win: true },
    15: { profit: 420, trades: 3, win: true },
    18: { profit: -90, trades: 1, win: false },
    22: { profit: 180, trades: 2, win: true },
    25: { profit: -120, trades: 2, win: false },
    28: { profit: 280, trades: 3, win: true },
    30: { profit: 150, trades: 1, win: true },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>May 2023</CardTitle>
        <CardDescription>Trading calendar view</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {/* Empty cells for alignment */}
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`empty-${i}`} className="h-14 rounded-md border border-dashed"></div>
          ))}
          {days.map((day) => {
            const dayData = tradeData[day as keyof typeof tradeData]
            return (
              <div
                key={day}
                className={cn(
                  "flex h-14 flex-col rounded-md border p-1",
                  dayData && dayData.win
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                    : dayData && !dayData.win
                      ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                      : "",
                )}
              >
                <div className="text-xs">{day}</div>
                {dayData && (
                  <>
                    <div
                      className={cn(
                        "mt-auto text-xs font-medium",
                        dayData.win ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                      )}
                    >
                      {dayData.profit > 0 ? "+" : ""}${Math.abs(dayData.profit)}
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
      </CardContent>
    </Card>
  )
}
