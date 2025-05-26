"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAccount } from "@/contexts/account-context"

interface AccountSelectorProps {
  className?: string
}

export function AccountSelector({ className }: AccountSelectorProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { selectedAccount, accounts, setSelectedAccount, loading } = useAccount()

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account)
    setOpen(false)
  }

  const handleAddAccount = () => {
    router.push('/settings?tab=accounts')
    setOpen(false)
  }

  if (loading) {
    return (
      <div className={cn("w-[280px]", className)}>
        <Button variant="outline" className="w-full justify-between" disabled>
          Loading accounts...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("w-[280px]", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedAccount ? (
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: selectedAccount.color || '#22c55e' }}
                />
                <span className="truncate">{selectedAccount.name}</span>
                {selectedAccount.phase && (
                  <Badge variant="outline" className="text-xs">
                    {selectedAccount.phase}
                  </Badge>
                )}
              </div>
            ) : (
              "Select account..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandInput placeholder="Search accounts..." />
            <CommandList>
              <CommandEmpty>No accounts found.</CommandEmpty>
              <CommandGroup>
                {accounts.map((account) => (
                  <CommandItem
                    key={account.id}
                    value={account.name}
                    onSelect={() => handleAccountSelect(account)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: account.color || '#22c55e' }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.balance.toLocaleString()} {account.currency}
                          {account.phase && ` • ${account.phase}`}
                        </div>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selectedAccount?.id === account.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem onSelect={handleAddAccount}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add new account
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedAccount && (
        <div className="mt-2 text-sm text-muted-foreground">
          Balance: {selectedAccount.balance.toLocaleString()} {selectedAccount.currency}
        </div>
      )}
    </div>
  )
} 