"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import {
  calculateProfit,
  calculatePositionSize,
  currencyPairsInfo,
  formatCurrency,
  formatPips,
} from "@/lib/trade-calculations"

const formSchema = z.object({
  symbol: z.string().min(1, {
    message: "Symbol is required.",
  }),
  direction: z.enum(["Buy", "Sell"], {
    required_error: "Direction is required.",
  }),
  entryPrice: z.string().min(1, {
    message: "Entry price is required.",
  }),
  exitPrice: z.string().min(1, {
    message: "Exit price is required.",
  }),
  stopLoss: z.string().optional(),
  volume: z.string().min(1, {
    message: "Volume is required.",
  }),
  accountBalance: z.string().optional(),
  riskPercentage: z.string().optional(),
})

type CalculatorFormValues = z.infer<typeof formSchema>

export function TradeProfitCalculator() {
  const [profitCalculation, setProfitCalculation] = useState<{
    profit: number
    pips: number
    pipValue: number
    isWin: boolean
  } | null>(null)

  const [positionSize, setPositionSize] = useState<number | null>(null)

  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "EURUSD",
      direction: "Buy",
      entryPrice: "1.0825",
      exitPrice: "1.0865",
      stopLoss: "1.0800",
      volume: "0.01",
      accountBalance: "100000",
      riskPercentage: "1",
    },
  })

  // Watch form values for real-time calculations
  const watchSymbol = form.watch("symbol")
  const watchDirection = form.watch("direction")
  const watchEntryPrice = form.watch("entryPrice")
  const watchExitPrice = form.watch("exitPrice")
  const watchVolume = form.watch("volume")
  const watchStopLoss = form.watch("stopLoss")
  const watchAccountBalance = form.watch("accountBalance")
  const watchRiskPercentage = form.watch("riskPercentage")

  // Calculate profit when relevant fields change
  useEffect(() => {
    const calculateAndUpdateProfit = async () => {
      if (
        watchSymbol &&
        watchDirection &&
        watchEntryPrice &&
        watchExitPrice &&
        watchVolume &&
        !isNaN(Number(watchEntryPrice)) &&
        !isNaN(Number(watchExitPrice)) &&
        !isNaN(Number(watchVolume))
      ) {
        try {
          const result = await calculateProfit(
            watchSymbol,
            watchDirection,
            Number(watchEntryPrice),
            Number(watchExitPrice),
            Number(watchVolume),
          )

          setProfitCalculation(result)
        } catch (error) {
          console.error("Error calculating profit:", error)
        }
      } else {
        setProfitCalculation(null)
      }
    }

    calculateAndUpdateProfit()
  }, [watchSymbol, watchDirection, watchEntryPrice, watchExitPrice, watchVolume])

  // Calculate position size when relevant fields change
  useEffect(() => {
    if (
      watchSymbol &&
      watchEntryPrice &&
      watchStopLoss &&
      watchAccountBalance &&
      watchRiskPercentage &&
      !isNaN(Number(watchEntryPrice)) &&
      !isNaN(Number(watchStopLoss)) &&
      !isNaN(Number(watchAccountBalance)) &&
      !isNaN(Number(watchRiskPercentage))
    ) {
      try {
        const result = calculatePositionSize(
          watchSymbol,
          Number(watchAccountBalance),
          Number(watchRiskPercentage),
          Number(watchEntryPrice),
          Number(watchStopLoss),
        )

        setPositionSize(result)
      } catch (error) {
        console.error("Error calculating position size:", error)
      }
    } else {
      setPositionSize(null)
    }
  }, [watchSymbol, watchEntryPrice, watchStopLoss, watchAccountBalance, watchRiskPercentage])

  async function onSubmit(data: CalculatorFormValues) {
    // Calculate final profit/loss
    if (data.symbol && data.direction && data.entryPrice && data.exitPrice && data.volume) {
      try {
        const result = await calculateProfit(
          data.symbol,
          data.direction,
          Number(data.entryPrice),
          Number(data.exitPrice),
          Number(data.volume),
        )

        setProfitCalculation(result)
      } catch (error) {
        console.error("Error calculating profit:", error)
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Trade Calculator</CardTitle>
        <CardDescription>Calculate profit/loss and position size for your trades</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select symbol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(currencyPairsInfo).map((pair) => (
                          <SelectItem key={pair} value={pair}>
                            {pair}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Buy">Buy (Long)</SelectItem>
                        <SelectItem value="Sell">Sell (Short)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume (Lots)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Standard lot size (e.g., 0.01, 0.1, 1.0)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00001" {...field} />
                    </FormControl>
                    <FormDescription>Used for position sizing</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Balance</FormLabel>
                    <FormControl>
                      <Input type="number" step="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Percentage</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>% of account to risk per trade</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit">Calculate</Button>
          </form>
        </Form>

        {profitCalculation && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Results</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Profit/Loss Calculation</h4>
                <div className="rounded-md border p-3">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Profit/Loss:</span>
                      <span
                        className={cn(
                          "font-medium",
                          profitCalculation.profit > 0
                            ? "text-green-600 dark:text-green-500"
                            : profitCalculation.profit < 0
                              ? "text-red-600 dark:text-red-500"
                              : "",
                        )}
                      >
                        {formatCurrency(profitCalculation.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pips:</span>
                      <span
                        className={cn(
                          "font-medium",
                          profitCalculation.pips > 0
                            ? "text-green-600 dark:text-green-500"
                            : profitCalculation.pips < 0
                              ? "text-red-600 dark:text-red-500"
                              : "",
                        )}
                      >
                        {formatPips(profitCalculation.pips)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pip Value:</span>
                      <span className="font-medium">{formatCurrency(profitCalculation.pipValue)} per pip</span>
                    </div>
                  </div>
                </div>
              </div>

              {positionSize !== null && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Position Sizing</h4>
                  <div className="rounded-md border p-3">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Recommended Size:</span>
                        <span className="font-medium">{positionSize} lots</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Risk Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(Number(watchAccountBalance) * (Number(watchRiskPercentage) / 100))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Risk Percentage:</span>
                        <span className="font-medium">{watchRiskPercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
