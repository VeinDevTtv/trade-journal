"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis } from "recharts"

export function PerformanceCharts() {
  // Sample data for equity curve
  const equityData = [
    { date: "May 1", equity: 10000 },
    { date: "May 5", equity: 10250 },
    { date: "May 10", equity: 10180 },
    { date: "May 15", equity: 10450 },
    { date: "May 20", equity: 10380 },
    { date: "May 25", equity: 10620 },
    { date: "May 30", equity: 10850 },
  ]

  // Sample data for profit by symbol
  const symbolData = [
    { symbol: "EURUSD", profit: 450 },
    { symbol: "GBPUSD", profit: 320 },
    { symbol: "USDJPY", profit: -120 },
    { symbol: "AUDUSD", profit: 180 },
    { symbol: "USDCAD", profit: -80 },
  ]

  // Sample data for profit by day
  const dayData = [
    { day: "Monday", profit: 320 },
    { day: "Tuesday", profit: -150 },
    { day: "Wednesday", profit: 280 },
    { day: "Thursday", profit: 420 },
    { day: "Friday", profit: 180 },
  ]

  // Sample data for win/loss ratio
  const winLossData = [
    { name: "Winning Trades", value: 28, color: "#22c55e" },
    { name: "Losing Trades", value: 14, color: "#ef4444" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>Your account balance over time</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit by Symbol</CardTitle>
          <CardDescription>Performance across different currency pairs</CardDescription>
        </CardHeader>
        <CardContent>
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
            </TabsContent>
            <TabsContent value="winloss" className="mt-0">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
