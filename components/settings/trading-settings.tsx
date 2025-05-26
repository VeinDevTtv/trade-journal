"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const tradingFormSchema = z.object({
  defaultLotSize: z.string().min(1, {
    message: "Default lot size is required.",
  }),
  defaultRiskPercentage: z.string().min(1, {
    message: "Default risk percentage is required.",
  }),
  defaultAccount: z.string().min(1, {
    message: "Please select a default account.",
  }),
  defaultTimeframe: z.string().min(1, {
    message: "Please select a default timeframe.",
  }),
  autoCalculatePositionSize: z.boolean().default(true),
  enforceRiskLimits: z.boolean().default(true),
  maxRiskPerTrade: z.string().optional(),
  maxDailyRisk: z.string().optional(),
  defaultTags: z.string().optional(),
})

type TradingFormValues = z.infer<typeof tradingFormSchema>

export function TradingSettings() {
  const form = useForm<TradingFormValues>({
    resolver: zodResolver(tradingFormSchema),
    defaultValues: {
      defaultLotSize: "0.01",
      defaultRiskPercentage: "1",
      defaultAccount: "FTMO Challenge",
      defaultTimeframe: "H1",
      autoCalculatePositionSize: true,
      enforceRiskLimits: true,
      maxRiskPerTrade: "2",
      maxDailyRisk: "5",
      defaultTags: "Trend Following, Breakout, Support/Resistance",
    },
  })

  function onSubmit(data: TradingFormValues) {
    toast({
      title: "Trading settings updated",
      description: "Your trading preferences have been saved.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trading Preferences</CardTitle>
          <CardDescription>Configure your default trading settings and risk parameters.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Values</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="defaultLotSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Lot Size</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>Standard lot size for new trades</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultRiskPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Risk Percentage</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>Default risk per trade (%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Account</FormLabel>
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
                        <FormDescription>Default account for new trades</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultTimeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Timeframe</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M1">1 Minute (M1)</SelectItem>
                            <SelectItem value="M5">5 Minutes (M5)</SelectItem>
                            <SelectItem value="M15">15 Minutes (M15)</SelectItem>
                            <SelectItem value="M30">30 Minutes (M30)</SelectItem>
                            <SelectItem value="H1">1 Hour (H1)</SelectItem>
                            <SelectItem value="H4">4 Hours (H4)</SelectItem>
                            <SelectItem value="D1">Daily (D1)</SelectItem>
                            <SelectItem value="W1">Weekly (W1)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Default timeframe for analysis</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="defaultTags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Trend Following, Breakout, Support/Resistance" {...field} />
                      </FormControl>
                      <FormDescription>Comma-separated list of commonly used tags</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                <h3 className="text-lg font-medium">Risk Management</h3>

                <FormField
                  control={form.control}
                  name="autoCalculatePositionSize"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Auto-Calculate Position Size</FormLabel>
                        <FormDescription>
                          Automatically calculate position size based on risk percentage and stop loss
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enforceRiskLimits"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Enforce Risk Limits</FormLabel>
                        <FormDescription>Show warnings when trades exceed your risk parameters</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="maxRiskPerTrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Risk Per Trade (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>Maximum risk percentage per trade</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxDailyRisk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Daily Risk (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormDescription>Maximum risk percentage per day</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
