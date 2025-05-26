"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Percent, Clock, BarChart3, Target } from "lucide-react"

export function PerformanceMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">68.5%</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600 dark:text-green-500 font-medium flex items-center">
              <ArrowUp className="mr-1 h-3 w-3" />
              +2.3%
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average RRR</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1:2.4</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600 dark:text-green-500 font-medium flex items-center">
              <ArrowUp className="mr-1 h-3 w-3" />
              +0.3
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Lots</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18.5</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-red-600 dark:text-red-500 font-medium flex items-center">
              <ArrowDown className="mr-1 h-3 w-3" />
              -2.1
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Hold Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1h 45m</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600 dark:text-green-500 font-medium flex items-center">
              <ArrowUp className="mr-1 h-3 w-3" />
              +15m
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
