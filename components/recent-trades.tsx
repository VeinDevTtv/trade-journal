"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorHandler } from "@/lib/error-handler"

interface Trade {
  id: number
  symbol: string
  direction: 'Buy' | 'Sell'
  profit: number
  entry_date: string
  entry_time: string
  exit_date?: string
  exit_time?: string
  is_win: boolean
  tags?: string[]
  notes?: string
}

export function RecentTrades() {
  const { isAuthenticated } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentTrades = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await apiService.getTrades({ 
          limit: 5,
          page: 1 
        })
        
        // Transform the data to match our interface
        const transformedTrades: Trade[] = response.data?.map((trade: any) => ({
          id: trade.id,
          symbol: trade.symbol,
          direction: (trade.direction === 'long' ? 'Buy' : 'Sell') as 'Buy' | 'Sell',
          profit: trade.profit || 0,
          entry_date: new Date(trade.entry_date).toLocaleDateString(),
          entry_time: new Date(trade.entry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          exit_date: trade.exit_date ? new Date(trade.exit_date).toLocaleDateString() : undefined,
          exit_time: trade.exit_date ? new Date(trade.exit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          is_win: trade.is_win,
          tags: trade.tags ? trade.tags.split(',').map((tag: string) => tag.trim()) : [],
          notes: trade.notes
        })) || []
        
        setTrades(transformedTrades)
      } catch (error: any) {
        const result = ErrorHandler.handle(error, {
          action: 'fetch recent trades',
          component: 'RecentTrades'
        })
        setError(result.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentTrades()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your 5 most recent trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please log in to view your recent trades</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your 5 most recent trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between rounded-md border p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your 5 most recent trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your 5 most recent trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No trades found. Start by adding your first trade!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <CardDescription>Your {trades.length} most recent trades</CardDescription>
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
                  {trade.entry_date} at {trade.entry_time}
                  {trade.exit_date && ` - ${trade.exit_date} at ${trade.exit_time}`}
                </div>
                {trade.tags && trade.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {trade.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  "text-sm font-medium",
                  trade.is_win ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
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
