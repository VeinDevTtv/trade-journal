"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function RecentTrades() {
  // Sample data for recent trades
  const trades = [
    {
      id: 1,
      symbol: "EURUSD",
      direction: "Buy",
      profit: 120.5,
      date: "May 28, 2023",
      time: "10:45 AM",
      win: true,
      tags: ["Trend Following", "News"],
    },
    {
      id: 2,
      symbol: "GBPUSD",
      direction: "Sell",
      profit: -80.25,
      date: "May 25, 2023",
      time: "2:30 PM",
      win: false,
      tags: ["Breakout"],
    },
    {
      id: 3,
      symbol: "USDJPY",
      direction: "Buy",
      profit: 95.75,
      date: "May 22, 2023",
      time: "9:15 AM",
      win: true,
      tags: ["Support/Resistance"],
    },
    {
      id: 4,
      symbol: "AUDUSD",
      direction: "Sell",
      profit: 150.3,
      date: "May 20, 2023",
      time: "3:45 PM",
      win: true,
      tags: ["Trend Following"],
    },
    {
      id: 5,
      symbol: "USDCAD",
      direction: "Buy",
      profit: -65.4,
      date: "May 18, 2023",
      time: "11:20 AM",
      win: false,
      tags: ["Reversal"],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <CardDescription>Your 5 most recent trades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trades.map((trade) => (
            <div key={trade.id} className="flex items-start justify-between rounded-md border p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{trade.symbol}</span>
                  <Badge variant={trade.direction === "Buy" ? "default" : "secondary"}>{trade.direction}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {trade.date} at {trade.time}
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {trade.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  "text-sm font-medium",
                  trade.win ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                )}
              >
                {trade.profit > 0 ? "+" : ""}${trade.profit.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
