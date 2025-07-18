"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, ChevronDown, Edit, ExternalLink, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorHandler } from "@/lib/error-handler"

interface Trade {
  id: number
  symbol: string
  direction: 'long' | 'short'
  entry_price: number
  exit_price?: number
  volume: number
  profit?: number
  entry_date: string
  exit_date?: string
  is_win: boolean
  tags?: string
  notes?: string
  screenshot_url?: string
}

export function TradeEntries() {
  const { isAuthenticated } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchTrades = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await apiService.getTrades({ 
          limit: 50,
          page: 1 
        })
        
        setTrades(response.data || [])
      } catch (error: any) {
        const result = ErrorHandler.handle(error, {
          action: 'fetch trades',
          component: 'TradeEntries'
        })
        setError(result.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrades()
  }, [isAuthenticated])

  const handleDeleteTrade = async (tradeId: number) => {
    try {
      await apiService.deleteTrade(tradeId)
      setTrades(prev => prev.filter(trade => trade.id !== tradeId))
    } catch (error: any) {
      ErrorHandler.handle(error, {
        action: 'delete trade',
        component: 'TradeEntries'
      })
    }
  }

  const filteredTrades = trades.filter(trade => {
    if (activeTab === "winning") return trade.is_win
    if (activeTab === "losing") return !trade.is_win
    return true
  })

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to view your trades</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-8" />
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
                <Skeleton className="aspect-[2/1] rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">All Trades</TabsTrigger>
          <TabsTrigger value="winning">Winning</TabsTrigger>
          <TabsTrigger value="losing">Losing</TabsTrigger>
        </TabsList>
        <div className="text-sm text-muted-foreground">
          Showing <strong>{filteredTrades.length}</strong> of <strong>{trades.length}</strong> trades
        </div>
      </div>
      
      <TabsContent value={activeTab} className="space-y-4">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {activeTab === "winning" 
                ? "No winning trades found" 
                : activeTab === "losing" 
                ? "No losing trades found" 
                : "No trades found. Start by adding your first trade!"}
            </p>
          </div>
        ) : (
          filteredTrades.map((trade) => (
            <Card key={trade.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {trade.symbol}
                      <Badge variant={trade.direction === "long" ? "default" : "secondary"}>
                        {trade.direction === "long" ? "Buy" : "Sell"}
                      </Badge>
                      {trade.is_win ? (
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
                      {new Date(trade.entry_date).toLocaleDateString()} at {new Date(trade.entry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {trade.exit_date && ` - ${new Date(trade.exit_date).toLocaleDateString()} at ${new Date(trade.exit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </CardDescription>
                  </div>
                  <div
                    className={cn(
                      "text-lg font-bold",
                      (trade.profit || 0) > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                    )}
                  >
                    {(trade.profit || 0) > 0 ? "+" : ""}${(trade.profit || 0).toFixed(2)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Entry Price</div>
                        <div className="font-medium">{trade.entry_price}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Exit Price</div>
                        <div className="font-medium">{trade.exit_price || "Open"}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Volume</div>
                        <div className="font-medium">{trade.volume} lots</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Direction</div>
                        <div className="flex items-center font-medium">
                          {trade.direction === "long" ? (
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
                    {trade.tags && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Tags</div>
                        <div className="flex flex-wrap gap-1">
                          {trade.tags.split(',').map((tag) => (
                            <Badge key={tag.trim()} variant="outline">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {trade.notes && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Notes</div>
                        <div className="text-sm">{trade.notes}</div>
                      </div>
                    )}
                  </div>
                  {trade.screenshot_url && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Screenshot</div>
                      <div className="relative aspect-[2/1] overflow-hidden rounded-md border">
                        <img
                          src={trade.screenshot_url}
                          alt={`Trade screenshot for ${trade.symbol}`}
                          className="object-cover w-full h-full"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                          onClick={() => window.open(trade.screenshot_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="sr-only">View full screenshot</span>
                        </Button>
                      </div>
                    </div>
                  )}
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 gap-1 text-xs text-red-600 dark:text-red-500"
                    onClick={() => handleDeleteTrade(trade.id)}
                  >
                    <Trash className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
