"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  type: z.string({
    required_error: "Please select an account type.",
  }),
  balance: z.string().min(1, {
    message: "Balance is required.",
  }),
  currency: z.string({
    required_error: "Please select a currency.",
  }),
  phase: z.string().optional(),
  maxDrawdown: z.string().optional(),
  profitTarget: z.string().optional(),
  color: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

// Sample account data
const accounts = [
  {
    id: 1,
    name: "FTMO Challenge",
    type: "FTMO",
    balance: "100000",
    currency: "USD",
    phase: "Challenge",
    maxDrawdown: "5",
    profitTarget: "10",
    color: "#22c55e", // green-500
  },
  {
    id: 2,
    name: "MyForexFunds",
    type: "MyForexFunds",
    balance: "50000",
    currency: "USD",
    phase: "Verification",
    maxDrawdown: "8",
    profitTarget: "12",
    color: "#3b82f6", // blue-500
  },
  {
    id: 3,
    name: "Demo Account",
    type: "Demo",
    balance: "10000",
    currency: "USD",
    phase: "Practice",
    maxDrawdown: "0",
    profitTarget: "0",
    color: "#f97316", // orange-500
  },
]

export function AccountSettings() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<(typeof accounts)[0] | null>(null)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      type: "",
      balance: "",
      currency: "USD",
      phase: "",
      maxDrawdown: "",
      profitTarget: "",
      color: "#22c55e",
    },
  })

  function onAddSubmit(data: AccountFormValues) {
    toast({
      title: "Account added",
      description: "Your trading account has been added successfully.",
    })
    setIsAddDialogOpen(false)
    form.reset()
  }

  function onEditSubmit(data: AccountFormValues) {
    toast({
      title: "Account updated",
      description: "Your trading account has been updated successfully.",
    })
    setIsEditDialogOpen(false)
    setEditingAccount(null)
    form.reset()
  }

  function handleEditAccount(account: (typeof accounts)[0]) {
    setEditingAccount(account)
    form.reset({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      phase: account.phase,
      maxDrawdown: account.maxDrawdown,
      profitTarget: account.profitTarget,
      color: account.color,
    })
    setIsEditDialogOpen(true)
  }

  function handleDeleteAccount(id: number) {
    toast({
      title: "Account deleted",
      description: "Your trading account has been deleted.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Trading Accounts</CardTitle>
            <CardDescription>Manage your prop firm and trading accounts.</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Trading Account</DialogTitle>
                <DialogDescription>Add a new prop firm or trading account to track.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="FTMO Challenge" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FTMO">FTMO</SelectItem>
                              <SelectItem value="MyForexFunds">MyForexFunds</SelectItem>
                              <SelectItem value="TrueForexFunds">TrueForexFunds</SelectItem>
                              <SelectItem value="PropFirm">Other Prop Firm</SelectItem>
                              <SelectItem value="Live">Live Account</SelectItem>
                              <SelectItem value="Demo">Demo Account</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phase/Stage</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select phase" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Challenge">Challenge</SelectItem>
                              <SelectItem value="Verification">Verification</SelectItem>
                              <SelectItem value="Funded">Funded</SelectItem>
                              <SelectItem value="Practice">Practice</SelectItem>
                              <SelectItem value="Live">Live</SelectItem>
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
                      name="balance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Balance</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="100000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
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
                      name="maxDrawdown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Drawdown (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                          </FormControl>
                          <FormDescription>Maximum allowed drawdown percentage</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profitTarget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profit Target (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10" {...field} />
                          </FormControl>
                          <FormDescription>Profit target percentage</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Color</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input type="color" {...field} className="w-12 h-8 p-1" />
                            <span className="text-sm text-muted-foreground">{field.value}</span>
                          </div>
                        </FormControl>
                        <FormDescription>Color used to identify this account in the UI</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Account</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Account Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Trading Account</DialogTitle>
                <DialogDescription>Update your trading account details.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                  {/* Same form fields as Add Account */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="FTMO Challenge" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FTMO">FTMO</SelectItem>
                              <SelectItem value="MyForexFunds">MyForexFunds</SelectItem>
                              <SelectItem value="TrueForexFunds">TrueForexFunds</SelectItem>
                              <SelectItem value="PropFirm">Other Prop Firm</SelectItem>
                              <SelectItem value="Live">Live Account</SelectItem>
                              <SelectItem value="Demo">Demo Account</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phase/Stage</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select phase" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Challenge">Challenge</SelectItem>
                              <SelectItem value="Verification">Verification</SelectItem>
                              <SelectItem value="Funded">Funded</SelectItem>
                              <SelectItem value="Practice">Practice</SelectItem>
                              <SelectItem value="Live">Live</SelectItem>
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
                      name="balance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Balance</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="100000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
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
                      name="maxDrawdown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Drawdown (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                          </FormControl>
                          <FormDescription>Maximum allowed drawdown percentage</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profitTarget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profit Target (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10" {...field} />
                          </FormControl>
                          <FormDescription>Profit target percentage</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Color</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input type="color" {...field} className="w-12 h-8 p-1" />
                            <span className="text-sm text-muted-foreground">{field.value}</span>
                          </div>
                        </FormControl>
                        <FormDescription>Color used to identify this account in the UI</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Update Account</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between rounded-md border p-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: account.color }}></div>
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {account.balance} {account.currency}
                      </span>
                      <span>•</span>
                      <Badge variant="outline">{account.phase}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditAccount(account)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit {account.name}</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete {account.name}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
