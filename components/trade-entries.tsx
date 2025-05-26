"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, ChevronDown, Edit, ExternalLink, Trash } from "lucide-react"

export function TradeEntries() {
  // Sample trade data
  const trades = [
    {
      id: 1,
      symbol: "EURUSD",
      direction: "Buy",
      entryPrice: 1.0825,
      exitPrice: 1.0865,
      volume: 0.5,
      profit: 200.0,
      date: "May 28, 2023",
      time: "10:45 AM",
      win: true,
      tags: ["Trend Following", "News"],
      notes: "Strong uptrend after ECB announcement. Entered on pullback to 20 EMA.",
      screenshot: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      symbol: "GBPUSD",
      direction: "Sell",
      entryPrice: 1.245,
      exitPrice: 1.241,
      volume: 0.4,
      profit: 160.0,
      date: "May 25, 2023",
      time: "2:30 PM",
      win: true,
      tags: ["Breakout", "Support/Resistance"],
      notes: "Broke key support level with strong momentum. Took profit at next support zone.",
      screenshot: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      symbol: "USDJPY",
      direction: "Buy",
      entryPrice: 139.5,
      exitPrice: 139.2,
      volume: 0.3,
      profit: -90.0,
      date: "May 22, 2023",
      time: "9:15 AM",
      win: false,
      tags: ["Support/Resistance", "Failed Breakout"],
      notes: "False breakout above resistance. Market quickly reversed after BOJ comments.",
      screenshot: "/placeholder.svg?height=200&width=400",
    },
  ]

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">All Trades</TabsTrigger>
          <TabsTrigger value="winning">Winning</TabsTrigger>
          <TabsTrigger value="losing">Losing</TabsTrigger>
        </TabsList>
        <div className="text-sm text-muted-foreground">
          Showing <strong>3</strong> of <strong>42</strong> trades
        </div>
      </div>
      <TabsContent value="all" className="space-y-4">
        {trades.map((trade) => (
          <Card key={trade.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {trade.symbol}
                    <Badge variant={trade.direction === "Buy" ? "default" : "secondary"}>{trade.direction}</Badge>
                    {trade.win ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      >
                        Win
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        Loss
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {trade.date} at {trade.time}
                  </CardDescription>
                </div>
                <div
                  className={cn(
                    "text-lg font-bold",
                    trade.profit > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                  )}
                >
                  {trade.profit > 0 ? "+" : ""}${trade.profit.toFixed(2)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Entry Price</div>
                      <div className="font-medium">{trade.entryPrice}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Exit Price</div>
                      <div className="font-medium">{trade.exitPrice}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Volume</div>
                      <div className="font-medium">{trade.volume} lots</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Direction</div>
                      <div className="flex items-center font-medium">
                        {trade.direction === "Buy" ? (
                          <>
                            <ArrowUp className="mr-1 h-3 w-3 text-green-600 dark:text-green-500" />
                            Long
                          </>
                        ) : (
                          <>
                            <ArrowDown className="mr-1 h-3 w-3 text-red-600 dark:text-red-500" />
                            Short
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {trade.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Notes</div>
                    <div className="text-sm">{trade.notes}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Screenshot</div>
                  <div className="relative aspect-[2/1] overflow-hidden rounded-md border">
                    <img
                      src={trade.screenshot || "/placeholder.svg"}
                      alt={`Trade screenshot for ${trade.symbol}`}
                      className="object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="sr-only">View full screenshot</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <ChevronDown className="h-3 w-3" />
                Show more details
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-red-600 dark:text-red-500">
                  <Trash className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </TabsContent>
      <TabsContent value="winning" className="space-y-4">
        {trades
          .filter((t) => t.win)
          .map((trade) => (
            <Card key={trade.id}>
              {/* Same card content as above */}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {trade.symbol}
                      <Badge variant={trade.direction === "Buy" ? "default" : "secondary"}>{trade.direction}</Badge>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      >
                        Win
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {trade.date} at {trade.time}
                    </CardDescription>
                  </div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-500">
                    +${trade.profit.toFixed(2)}
                  </div>
                </div>
              </CardHeader>
              {/* Rest of card content would be the same */}
            </Card>
          ))}
      </TabsContent>
      <TabsContent value="losing" className="space-y-4">
        {trades
          .filter((t) => !t.win)
          .map((trade) => (
            <Card key={trade.id}>
              {/* Same card content as above */}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {trade.symbol}
                      <Badge variant={trade.direction === "Buy" ? "default" : "secondary"}>{trade.direction}</Badge>
                      <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        Loss
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {trade.date} at {trade.time}
                    </CardDescription>
                  </div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-500">${trade.profit.toFixed(2)}</div>
                </div>
              </CardHeader>
              {/* Rest of card content would be the same */}
            </Card>
          ))}
      </TabsContent>
    </Tabs>
  )
}
