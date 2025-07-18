"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from '@/lib/api'
import { toast } from 'sonner'
import { ErrorHandler } from '@/lib/error-handler'

interface User {
  id: number
  discord_id: string
  username: string
  discriminator: string
  avatar?: string
  email?: string
  total_trades?: number
  total_profit?: number
  accounts_count?: number
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!user

  const login = async (token: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const userData = await apiService.login(token)
      setUser(userData)
      
      toast.success('Successfully logged in!')
    } catch (error: any) {
      const result = ErrorHandler.handle(error, { 
        action: 'login',
        component: 'AuthProvider' 
      })
      setError(result.message)
      throw result.error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await apiService.logout()
      setUser(null)
      
      toast.success('Successfully logged out!')
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      setUser(null)
      apiService.setToken(null)
      
      ErrorHandler.handle(error, { 
        action: 'logout',
        component: 'AuthProvider' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      setError(null)
      const userData = await apiService.getProfile()
      setUser(userData)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to refresh user data'
      setError(errorMessage)
      
      // If token is invalid, clear auth state
      if (error.status === 401 || error.status === 403) {
        setUser(null)
        apiService.setToken(null)
      }
      
      throw error
    }
  }

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check if we have a token
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      if (!token) {
        setUser(null)
        return
      }

      // Verify token with server
      const authStatus = await apiService.checkAuthStatus()
      
      if (authStatus.authenticated && authStatus.user) {
        setUser(authStatus.user)
      } else {
        setUser(null)
        apiService.setToken(null)
      }
    } catch (error: any) {
      console.error('Auth check failed:', error)
      setUser(null)
      apiService.setToken(null)
      
      // Don't show error toast for auth check failures
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (typeof window === 'undefined') return
      
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const error = urlParams.get('error')
      
      if (token) {
        try {
          await login(token)
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (error) {
          console.error('OAuth login failed:', error)
        }
      } else if (error) {
        let errorMessage = 'Authentication failed'
        switch (error) {
          case 'auth_failed':
            errorMessage = 'Discord authentication failed'
            break
          case 'no_user':
            errorMessage = 'No user data received'
            break
          case 'server_error':
            errorMessage = 'Server error during authentication'
            break
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    handleOAuthCallback()
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    error,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 