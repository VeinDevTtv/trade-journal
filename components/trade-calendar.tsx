"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function TradeCalendar() {
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

  // Sample trade details for a specific day
  const dayTrades = [
    {
      id: 1,
      symbol: "EURUSD",
      direction: "Buy",
      profit: 120.5,
      time: "10:45 AM",
      win: true,
    },
    {
      id: 2,
      symbol: "GBPUSD",
      direction: "Sell",
      profit: 200.25,
      time: "2:30 PM",
      win: true,
    },
    {
      id: 3,
      symbol: "USDJPY",
      direction: "Buy",
      profit: -50.75,
      time: "4:15 PM",
      win: false,
    },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-4">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <div key={day} className="text-center text-sm font-medium">
              {day}
            </div>
          ))}
          {/* Empty cells for alignment */}
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`empty-${i}`} className="h-28 rounded-md border border-dashed"></div>
          ))}
          {days.map((day) => {
            const dayData = tradeData[day as keyof typeof tradeData]
            return (
              <Dialog key={day}>
                <DialogTrigger asChild>
                  <div
                    className={cn(
                      "flex h-28 cursor-pointer flex-col rounded-md border p-2 transition-colors hover:bg-accent",
                      dayData && dayData.win
                        ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                        : dayData && !dayData.win
                          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                          : "",
                    )}
                  >
                    <div className="text-sm font-medium">{day}</div>
                    {dayData && (
                      <>
                        <div
                          className={cn(
                            "mt-auto text-sm font-medium",
                            dayData.win ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                          )}
                        >
                          {dayData.profit > 0 ? "+" : ""}${Math.abs(dayData.profit)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dayData.trades} trade{dayData.trades > 1 ? "s" : ""}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Array.from({ length: Math.min(dayData.trades, 3) }).map((_, i) => (
                            <div
                              key={i}
                              className={cn("h-2 w-2 rounded-full", dayData.win ? "bg-green-500" : "bg-red-500")}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </DialogTrigger>
                {dayData && (
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>May {day}, 2023</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Total P&L</div>
                        <div
                          className={cn(
                            "text-lg font-bold",
                            dayData.win ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                          )}
                        >
                          {dayData.profit > 0 ? "+" : ""}${Math.abs(dayData.profit)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Trades</div>
                        <div className="text-sm font-medium">{dayData.trades}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Trade Details</div>
                        {dayTrades.map((trade) => (
                          <div key={trade.id} className="flex items-center justify-between rounded-md border p-2">
                            <div className="flex items-center gap-2">
                              <div className={cn("h-2 w-2 rounded-full", trade.win ? "bg-green-500" : "bg-red-500")} />
                              <div className="text-sm">{trade.symbol}</div>
                              <Badge variant={trade.direction === "Buy" ? "default" : "secondary"} className="text-xs">
                                {trade.direction}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-xs text-muted-foreground">{trade.time}</div>
                              <div
                                className={cn(
                                  "text-sm font-medium",
                                  trade.profit > 0
                                    ? "text-green-600 dark:text-green-500"
                                    : "text-red-600 dark:text-red-500",
                                )}
                              >
                                {trade.profit > 0 ? "+" : ""}${Math.abs(trade.profit).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
