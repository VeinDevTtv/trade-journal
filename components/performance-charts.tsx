"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorHandler } from "@/lib/error-handler"

interface EquityData {
  date: string
  equity: number
}

interface SymbolData {
  symbol: string
  profit: number
}

interface DayData {
  day: string
  profit: number
}

interface WinLossData {
  name: string
  value: number
  color: string
}

export function PerformanceCharts() {
  const { isAuthenticated } = useAuth()
  const [equityData, setEquityData] = useState<EquityData[]>([])
  const [symbolData, setSymbolData] = useState<SymbolData[]>([])
  const [dayData, setDayData] = useState<DayData[]>([])
  const [winLossData, setWinLossData] = useState<WinLossData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch all analytics data
        const [analytics, performanceBySymbol, riskMetrics] = await Promise.all([
          apiService.getAnalytics(),
          apiService.getPerformanceBySymbol(),
          apiService.getRiskMetrics()
        ])

        // Transform equity data
        if (analytics.equityCurve) {
          setEquityData(analytics.equityCurve.map((point: any) => ({
            date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            equity: point.equity
          })))
        }

        // Transform symbol performance data
        if (performanceBySymbol) {
          setSymbolData(performanceBySymbol.map((item: any) => ({
            symbol: item.symbol,
            profit: item.total_profit || 0
          })))
        }

        // Transform day performance data
        if (analytics.performanceByDay) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          setDayData(analytics.performanceByDay.map((item: any) => ({
            day: dayNames[item.day_of_week] || `Day ${item.day_of_week}`,
            profit: item.total_profit || 0
          })))
        }

        // Transform win/loss data
        if (riskMetrics) {
          const winningTrades = riskMetrics.winning_trades || 0
          const losingTrades = riskMetrics.losing_trades || 0
          setWinLossData([
            { name: "Winning Trades", value: winningTrades, color: "#22c55e" },
            { name: "Losing Trades", value: losingTrades, color: "#ef4444" },
          ])
        }

      } catch (error: any) {
        const result = ErrorHandler.handle(error, {
          action: 'fetch analytics data',
          component: 'PerformanceCharts'
        })
        setError(result.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Performance Charts</CardTitle>
            <CardDescription>Please log in to view your performance analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Login to view charts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Equity Curve</CardTitle>
            <CardDescription>Your account balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profit by Symbol</CardTitle>
            <CardDescription>Performance across different currency pairs</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>Analysis of your trading patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Performance Charts</CardTitle>
            <CardDescription>Error loading analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-red-600 dark:text-red-500">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>Your account balance over time</CardDescription>
        </CardHeader>
        <CardContent>
          {equityData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">No equity data available</p>
            </div>
          ) : (
            <ChartContainer
              config={{
                equity: {
                  label: "Equity",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <AreaChart data={equityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="var(--color-equity)"
                  fill="var(--color-equity)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit by Symbol</CardTitle>
          <CardDescription>Performance across different currency pairs</CardDescription>
        </CardHeader>
        <CardContent>
          {symbolData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">No symbol data available</p>
            </div>
          ) : (
            <ChartContainer
              config={{
                profit: {
                  label: "Profit",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={symbolData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Bar dataKey="profit">
                  {symbolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit > 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Tabs defaultValue="day">
            <div className="flex items-center justify-between">
              <CardTitle>Performance Breakdown</CardTitle>
              <TabsList>
                <TabsTrigger value="day">By Day</TabsTrigger>
                <TabsTrigger value="winloss">Win/Loss</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>Analysis of your trading patterns</CardDescription>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="day">
            <TabsContent value="day" className="mt-0">
              {dayData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No daily performance data available</p>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    profit: {
                      label: "Profit",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Bar dataKey="profit">
                      {dayData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.profit > 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </TabsContent>
            <TabsContent value="winloss" className="mt-0">
              {winLossData.every(item => item.value === 0) ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No win/loss data available</p>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <PieChart width={300} height={300}>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
