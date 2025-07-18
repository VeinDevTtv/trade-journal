"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface Account {
  id: number
  name: string
  type: string
  balance: number
  currency: string
  phase?: string
  color: string
  is_active: boolean
}

interface AccountContextType {
  selectedAccount: Account | null
  accounts: Account[]
  setSelectedAccount: (account: Account) => void
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  refreshAccounts: () => Promise<void>
  createAccount: (accountData: Omit<Account, 'id' | 'color'>) => Promise<void>
  updateAccount: (id: number, accountData: Partial<Account>) => Promise<void>
  deleteAccount: (id: number) => Promise<void>
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
  children: React.ReactNode
}

// Default colors for different account types
const getAccountColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'FTMO': '#22c55e',
    'MyForexFunds': '#3b82f6',
    'Demo': '#f97316',
    'Live': '#ef4444',
    'Challenge': '#8b5cf6',
    'Verification': '#06b6d4',
  }
  return colorMap[type] || '#6b7280'
}

export function AccountProvider({ children }: AccountProviderProps) {
  const [selectedAccount, setSelectedAccountState] = useState<Account | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()

  const refreshAccounts = async () => {
    if (!isAuthenticated) {
      setAccounts([])
      setSelectedAccountState(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const accountsData = await apiService.getAccounts()
      
      // Add colors to accounts if not present
      const accountsWithColors = accountsData.map(account => ({
        ...account,
        color: account.color || getAccountColor(account.type)
      }))
      
      setAccounts(accountsWithColors)
      
      // Load selected account from localStorage or set first account
      const savedAccountId = localStorage.getItem('selectedAccountId')
      if (savedAccountId) {
        const savedAccount = accountsWithColors.find(acc => acc.id === parseInt(savedAccountId))
        if (savedAccount) {
          setSelectedAccountState(savedAccount)
        } else if (accountsWithColors.length > 0) {
          setSelectedAccountState(accountsWithColors[0])
        }
      } else if (accountsWithColors.length > 0) {
        setSelectedAccountState(accountsWithColors[0])
      }
    } catch (error: any) {
      console.error('Failed to load accounts:', error)
      toast.error(error.message || 'Failed to load accounts')
      
      // If unauthorized, clear accounts
      if (error.status === 401 || error.status === 403) {
        setAccounts([])
        setSelectedAccountState(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async (accountData: Omit<Account, 'id' | 'color'>) => {
    try {
      const newAccount = await apiService.createAccount(accountData)
      toast.success('Account created successfully!')
      await refreshAccounts()
    } catch (error: any) {
      console.error('Failed to create account:', error)
      toast.error(error.message || 'Failed to create account')
      throw error
    }
  }

  const updateAccount = async (id: number, accountData: Partial<Account>) => {
    try {
      await apiService.updateAccount(id, accountData)
      toast.success('Account updated successfully!')
      await refreshAccounts()
      
      // Update selected account if it was the one being updated
      if (selectedAccount?.id === id) {
        const updatedAccount = accounts.find(acc => acc.id === id)
        if (updatedAccount) {
          setSelectedAccountState({ ...updatedAccount, ...accountData })
        }
      }
    } catch (error: any) {
      console.error('Failed to update account:', error)
      toast.error(error.message || 'Failed to update account')
      throw error
    }
  }

  const deleteAccount = async (id: number) => {
    try {
      await apiService.deleteAccount(id)
      toast.success('Account deleted successfully!')
      
      // If deleted account was selected, select another one
      if (selectedAccount?.id === id) {
        const remainingAccounts = accounts.filter(acc => acc.id !== id)
        setSelectedAccountState(remainingAccounts.length > 0 ? remainingAccounts[0] : null)
        localStorage.removeItem('selectedAccountId')
      }
      
      await refreshAccounts()
    } catch (error: any) {
      console.error('Failed to delete account:', error)
      toast.error(error.message || 'Failed to delete account')
      throw error
    }
  }

  // Load accounts when authentication state changes
  useEffect(() => {
    refreshAccounts()
  }, [isAuthenticated, user])

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
    refreshAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  }

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  )
} 