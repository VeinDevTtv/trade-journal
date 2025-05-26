"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Download, Upload, FileJson, FileSpreadsheet, Trash2, Database, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const dataFormSchema = z.object({
  autoBackup: z.boolean().default(true),
  backupFrequency: z.string().optional(),
  autoSync: z.boolean().default(true),
})

type DataFormValues = z.infer<typeof dataFormSchema>

export function DataSettings() {
  const form = useForm<DataFormValues>({
    resolver: zodResolver(dataFormSchema),
    defaultValues: {
      autoBackup: true,
      backupFrequency: "daily",
      autoSync: true,
    },
  })

  function onSubmit(data: DataFormValues) {
    toast({
      title: "Data settings updated",
      description: "Your data management preferences have been saved.",
    })
  }

  function handleExportData(format: string) {
    toast({
      title: "Exporting data",
      description: `Your trading data is being exported in ${format.toUpperCase()} format.`,
    })
  }

  function handleImportData() {
    toast({
      title: "Import started",
      description: "Your data is being imported. This may take a few moments.",
    })
  }

  function handleClearData() {
    toast({
      title: "Data cleared",
      description: "All your trading data has been cleared.",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your trading data, backups, and imports/exports.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import-export" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="import-export">Import/Export</TabsTrigger>
              <TabsTrigger value="backup">Backup & Sync</TabsTrigger>
              <TabsTrigger value="data-management">Data Management</TabsTrigger>
            </TabsList>
            <TabsContent value="import-export" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">
                  Export your trading journal data in various formats for backup or analysis in other tools.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => handleExportData("csv")}>
                    <FileSpreadsheet className="h-4 w-4" />
                    Export as CSV
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => handleExportData("json")}>
                    <FileJson className="h-4 w-4" />
                    Export as JSON
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => handleExportData("pdf")}>
                    <Download className="h-4 w-4" />
                    Export as PDF
                  </Button>
                </div>

                <Separator className="my-4" />

                <h3 className="text-lg font-medium">Import Data</h3>
                <p className="text-sm text-muted-foreground">
                  Import trading data from other platforms or previous exports.
                </p>
                <div className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input id="import-file" type="file" accept=".csv,.json,.xlsx" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={handleImportData}>
                      <Upload className="h-4 w-4" />
                      Import Data
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertTitle>Supported Import Formats</AlertTitle>
                  <AlertDescription>
                    We support imports from CSV, JSON, and Excel files. We also support direct imports from MyFxBook,
                    TradeLocker, and other popular trading platforms.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
            <TabsContent value="backup" className="space-y-4 pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="autoBackup"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Automatic Backups</FormLabel>
                          <FormDescription>Automatically backup your trading data</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("autoBackup") && (
                    <FormField
                      control={form.control}
                      name="backupFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Backup Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>How often to create backups</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="autoSync"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Cloud Sync</FormLabel>
                          <FormDescription>Sync your data across devices</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" className="gap-2">
                      <Database className="h-4 w-4" />
                      Create Manual Backup
                    </Button>
                    <Button type="button" variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Sync Now
                    </Button>
                  </div>

                  <Button type="submit">Save Settings</Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="data-management" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your trading data and perform maintenance operations.
                </p>

                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20">
                  <div className="flex items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-500">Data Storage</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        Your data is currently stored locally in your browser. For better security and to prevent data
                        loss, we recommend enabling cloud sync.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="text-sm font-medium">Clear Data</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Clear specific data or reset your entire trading journal. This action cannot be undone.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      Clear Trade History
                    </Button>
                    <Button variant="outline" size="sm">
                      Reset Statistics
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2" onClick={handleClearData}>
                      <Trash2 className="h-4 w-4" />
                      Reset Everything
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <h4 className="text-sm font-medium">Data Statistics</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Trades:</span>
                      <span className="text-sm font-medium">42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Storage Used:</span>
                      <span className="text-sm font-medium">1.2 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Backup:</span>
                      <span className="text-sm font-medium">May 26, 2023 (2 days ago)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Sync:</span>
                      <span className="text-sm font-medium">Today at 10:45 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
