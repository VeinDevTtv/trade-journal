"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, DollarSign, Percent, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorHandler } from "@/lib/error-handler"

interface AnalyticsData {
  totalPnl: number
  totalPnlChange: number
  winRate: number
  winRateChange: number
  totalTrades: number
  totalTradesChange: number
  bestDay: {
    profit: number
    date: string
    trades: number
  }
}

export function DashboardCards() {
  const { isAuthenticated } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const data = await apiService.getAnalyticsSummary()
        setAnalytics(data)
      } catch (error: any) {
        const result = ErrorHandler.handle(error, {
          action: 'fetch analytics summary',
          component: 'DashboardCards'
        })
        setError(result.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Please log in</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <p className="text-xs text-muted-foreground">Login to view data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">--</div>
              <p className="text-xs text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${analytics?.totalPnl && analytics.totalPnl >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
            {analytics?.totalPnl ? `${analytics.totalPnl >= 0 ? '+' : ''}$${analytics.totalPnl.toFixed(2)}` : '$0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics?.totalPnlChange !== undefined && (
              <span className={`font-medium flex items-center ${analytics.totalPnlChange >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {analytics.totalPnlChange >= 0 ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                {analytics.totalPnlChange >= 0 ? '+' : ''}{analytics.totalPnlChange.toFixed(1)}%
              </span>
            )}
            {" "}from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics?.winRate ? `${analytics.winRate.toFixed(1)}%` : '0%'}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics?.winRateChange !== undefined && (
              <span className={`font-medium flex items-center ${analytics.winRateChange >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {analytics.winRateChange >= 0 ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                {analytics.winRateChange >= 0 ? '+' : ''}{analytics.winRateChange.toFixed(1)}%
              </span>
            )}
            {" "}from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.totalTrades || 0}</div>
          <p className="text-xs text-muted-foreground">
            {analytics?.totalTradesChange !== undefined && (
              <span className={`font-medium flex items-center ${analytics.totalTradesChange >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {analytics.totalTradesChange >= 0 ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                {analytics.totalTradesChange >= 0 ? '+' : ''}{analytics.totalTradesChange}
              </span>
            )}
            {" "}from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Day</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${analytics?.bestDay?.profit && analytics.bestDay.profit >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
            {analytics?.bestDay?.profit ? `${analytics.bestDay.profit >= 0 ? '+' : ''}$${analytics.bestDay.profit.toFixed(2)}` : '$0.00'}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics?.bestDay?.date ? `${analytics.bestDay.date} (${analytics.bestDay.trades} trade${analytics.bestDay.trades !== 1 ? 's' : ''})` : 'No trades yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
