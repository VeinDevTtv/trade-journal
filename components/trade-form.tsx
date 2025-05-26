"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon, Plus, X, Info } from "lucide-react"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { calculateProfit, currencyPairsInfo, formatCurrency, formatPips, calculateRRR } from "@/lib/trade-calculations"

const formSchema = z.object({
  symbol: z.string().min(1, {
    message: "Symbol is required.",
  }),
  direction: z.enum(["Buy", "Sell"], {
    required_error: "Direction is required.",
  }),
  date: z.date({
    required_error: "Date is required.",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Time must be in HH:MM format.",
  }),
  entryPrice: z.string().min(1, {
    message: "Entry price is required.",
  }),
  exitPrice: z.string().min(1, {
    message: "Exit price is required.",
  }),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
  volume: z.string().min(1, {
    message: "Volume is required.",
  }),
  account: z.string().min(1, {
    message: "Account is required.",
  }),
  accountBalance: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  screenshot: z.instanceof(File).optional(),
  isWin: z.boolean().default(false),
})

type TradeFormValues = z.infer<typeof formSchema>

// Common currency pairs
const currencyPairs = Object.keys(currencyPairsInfo)

// Common trade tags
const commonTags = [
  "Trend Following",
  "Breakout",
  "Support/Resistance",
  "News",
  "Reversal",
  "Scalp",
  "Swing",
  "Failed Breakout",
  "Liquidity Sweep",
  "Range Bound",
]

// Account balances for different accounts
const accountBalances = {
  "FTMO Challenge": "100000",
  MyForexFunds: "50000",
  "Demo Account": "10000",
}

export function TradeForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [profitCalculation, setProfitCalculation] = useState<{
    profit: number
    pips: number
    pipValue: number
    isWin: boolean
  } | null>(null)
  const [rrr, setRRR] = useState<number | null>(null)

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "EURUSD",
      direction: "Buy",
      date: new Date(),
      time: format(new Date(), "HH:mm"),
      entryPrice: "",
      exitPrice: "",
      stopLoss: "",
      takeProfit: "",
      volume: "0.01",
      account: "FTMO Challenge",
      accountBalance: accountBalances["FTMO Challenge"],
      tags: [],
      notes: "",
      isWin: false,
    },
  })

  // Watch form values for real-time calculations
  const watchSymbol = form.watch("symbol")
  const watchDirection = form.watch("direction")
  const watchEntryPrice = form.watch("entryPrice")
  const watchExitPrice = form.watch("exitPrice")
  const watchVolume = form.watch("volume")
  const watchStopLoss = form.watch("stopLoss")
  const watchTakeProfit = form.watch("takeProfit")
  const watchAccount = form.watch("account")

  // Update account balance when account changes
  useEffect(() => {
    if (watchAccount) {
      form.setValue("accountBalance", accountBalances[watchAccount as keyof typeof accountBalances] || "")
    }
  }, [watchAccount, form])

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
          form.setValue("isWin", result.isWin)
        } catch (error) {
          console.error("Error calculating profit:", error)
        }
      } else {
        setProfitCalculation(null)
      }
    }

    calculateAndUpdateProfit()
  }, [watchSymbol, watchDirection, watchEntryPrice, watchExitPrice, watchVolume, form])

  // Calculate RRR when relevant fields change
  useEffect(() => {
    if (
      watchEntryPrice &&
      watchStopLoss &&
      watchTakeProfit &&
      !isNaN(Number(watchEntryPrice)) &&
      !isNaN(Number(watchStopLoss)) &&
      !isNaN(Number(watchTakeProfit))
    ) {
      const result = calculateRRR(Number(watchStopLoss), Number(watchTakeProfit), Number(watchEntryPrice))
      setRRR(result)
    } else {
      setRRR(null)
    }
  }, [watchEntryPrice, watchStopLoss, watchTakeProfit])

  async function onSubmit(data: TradeFormValues) {
    // Include the selected tags in the form data
    data.tags = selectedTags

    // Calculate final profit/loss
    let profit = 0
    let pips = 0

    if (profitCalculation) {
      profit = profitCalculation.profit
      pips = profitCalculation.pips
    }

    // In a real app, you would send this data to your backend
    console.log({
      ...data,
      profit,
      pips,
      rrr,
      calculationDetails: profitCalculation,
    })

    toast({
      title: "Trade added successfully",
      description: (
        <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(
              {
                ...data,
                profit: formatCurrency(profit),
                pips: formatPips(pips),
                rrr: rrr ? `1:${rrr}` : "N/A",
              },
              null,
              2,
            )}
          </code>
        </pre>
      ),
    })

    // Close the dialog
    onOpenChange(false)

    // Reset the form
    form.reset()
    setSelectedTags([])
    setScreenshotPreview(null)
    setProfitCalculation(null)
    setRRR(null)
  }

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
    setCustomTag("")
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("screenshot", file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
          <DialogDescription>Enter the details of your trade. All fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Notes & Media</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select symbol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencyPairs.map((pair) => (
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
                        <FormLabel>Direction *</FormLabel>
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
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
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
                        <FormLabel>Entry Price *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.00001" placeholder="1.0825" {...field} />
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
                        <FormLabel>Exit Price *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.00001" placeholder="1.0865" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stopLoss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Stop Loss
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Used for RRR calculation</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.00001" placeholder="1.0800" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="takeProfit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Take Profit
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Used for RRR calculation</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.00001" placeholder="1.0900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Live Calculation Card */}
                {profitCalculation && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Trade Result</h4>
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
                        <div>
                          <h4 className="text-sm font-medium mb-2">Risk Analysis</h4>
                          <div className="space-y-1">
                            {rrr !== null ? (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Risk-to-Reward:</span>
                                <span className="font-medium">1:{rrr}</span>
                              </div>
                            ) : (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Risk-to-Reward:</span>
                                <span className="text-sm text-muted-foreground">Add SL & TP to calculate</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Trade Outcome:</span>
                              <span
                                className={cn(
                                  "font-medium",
                                  profitCalculation.isWin
                                    ? "text-green-600 dark:text-green-500"
                                    : "text-red-600 dark:text-red-500",
                                )}
                              >
                                {profitCalculation.isWin ? "Win" : "Loss"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="volume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume (Lots) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.01" {...field} />
                        </FormControl>
                        <FormDescription>Standard lot size (e.g., 0.01, 0.1, 1.0)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FTMO Challenge">FTMO Challenge</SelectItem>
                            <SelectItem value="MyForexFunds">MyForexFunds</SelectItem>
                            <SelectItem value="Demo Account">Demo Account</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="accountBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Balance</FormLabel>
                      <FormControl>
                        <Input type="number" step="1000" placeholder="100000" {...field} />
                      </FormControl>
                      <FormDescription>Current account balance in USD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                <FormField
                  control={form.control}
                  name="isWin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Mark as Winning Trade</FormLabel>
                        <FormDescription>
                          Automatically calculated based on entry/exit prices, but you can override.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {tag} tag</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom tag..."
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag(customTag)
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => addTag(customTag)}>
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add tag</span>
                    </Button>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Common tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {commonTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add your analysis, thoughts, or lessons learned from this trade..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Document your strategy, reasoning, and observations.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Screenshot</FormLabel>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input id="screenshot" type="file" accept="image/*" onChange={handleFileChange} />
                  </div>

                  {screenshotPreview && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                      <div className="relative aspect-[2/1] overflow-hidden rounded-md border">
                        <img
                          src={screenshotPreview || "/placeholder.svg"}
                          alt="Trade screenshot preview"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Trade</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
