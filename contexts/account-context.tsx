"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface Account {
  id: number
  name: string
  type: string
  balance: number
  currency: string
  phase?: string
  color?: string
  is_active: boolean
}

interface AccountContextType {
  selectedAccount: Account | null
  accounts: Account[]
  setSelectedAccount: (account: Account) => void
  setAccounts: (accounts: Account[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}

interface AccountProviderProps {
  children: ReactNode
}

export function AccountProvider({ children }: AccountProviderProps) {
  const [selectedAccount, setSelectedAccountState] = useState<Account | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - in real app this would come from API
  const mockAccounts: Account[] = [
    {
      id: 1,
      name: "FTMO Challenge",
      type: "FTMO",
      balance: 100000,
      currency: "USD",
      phase: "Challenge",
      color: "#22c55e",
      is_active: true,
    },
    {
      id: 2,
      name: "MyForexFunds",
      type: "MyForexFunds", 
      balance: 50000,
      currency: "USD",
      phase: "Verification",
      color: "#3b82f6",
      is_active: true,
    },
    {
      id: 3,
      name: "Demo Account",
      type: "Demo",
      balance: 10000,
      currency: "USD",
      phase: "Practice",
      color: "#f97316",
      is_active: true,
    },
  ]

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true)
        
        // In real app: 
        // const response = await fetch('/api/accounts')
        // const data = await response.json()
        // setAccounts(data.accounts)
        
        // For now, use mock data
        setAccounts(mockAccounts)
        
        // Load selected account from localStorage
        const savedAccountId = localStorage.getItem('selectedAccountId')
        if (savedAccountId) {
          const savedAccount = mockAccounts.find(acc => acc.id === parseInt(savedAccountId))
          if (savedAccount) {
            setSelectedAccountState(savedAccount)
          } else if (mockAccounts.length > 0) {
            setSelectedAccountState(mockAccounts[0])
          }
        } else if (mockAccounts.length > 0) {
          setSelectedAccountState(mockAccounts[0])
        }
      } catch (error) {
        console.error('Failed to load accounts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [])

  const setSelectedAccount = (account: Account) => {
    setSelectedAccountState(account)
    localStorage.setItem('selectedAccountId', account.id.toString())
  }

  const value: AccountContextType = {
    selectedAccount,
    accounts,
    setSelectedAccount,
    setAccounts,
    loading,
    setLoading,
  }

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  )
} 