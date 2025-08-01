import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useTradeStore } from './store/tradeStore'
import { TableView } from './components/TableView'
import { CalendarView } from './components/CalendarView'
import { DashboardView } from './components/DashboardView'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { 
  BarChart3, 
  Calendar, 
  Moon, 
  Sun, 
  TrendingUp, 
  Activity,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Target,
  PieChart
} from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'calendar'>('dashboard')
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })
  const { currentMonth, setCurrentMonth, getTradeSummary, getCurrentMonthTrades } = useTradeStore()

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth.month
    let newYear = currentMonth.year

    if (direction === 'prev') {
      newMonth -= 1
      if (newMonth < 1) {
        newMonth = 12
        newYear -= 1
      }
    } else {
      newMonth += 1
      if (newMonth > 12) {
        newMonth = 1
        newYear += 1
      }
    }

    setCurrentMonth(newYear, newMonth)
  }

  const summary = getTradeSummary()
  const trades = getCurrentMonthTrades()

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: PieChart,
      description: 'Overview & Analytics'
    },
    { 
      id: 'table', 
      label: 'Trades', 
      icon: BarChart3,
      description: 'Trade Management'
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: Calendar,
      description: 'Daily View'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            border: isDark ? '1px solid #374151' : '1px solid #d1d5db',
          },
        }}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Trading Journal Pro
                  </CardTitle>
                  <p className="text-muted-foreground text-lg">
                    Professional trading performance analytics
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Quick Stats */}
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className={`text-xl font-bold ${summary.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(summary.totalProfitLoss).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">P&L</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">
                        {summary.winRate.toFixed(0)}%
                      </div>
                      <div className="text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {trades.length}
                      </div>
                      <div className="text-muted-foreground">Trades</div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    {/* Month Navigation */}
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                        className="h-8 w-8 p-0 hover:bg-background"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[140px] text-center font-medium px-3 py-1">
                        {monthNames[currentMonth.month - 1]} {currentMonth.year}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                        className="h-8 w-8 p-0 hover:bg-background"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Theme Toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleTheme}
                      className="h-10 w-10 hover:scale-105 transition-transform"
                    >
                      <motion.div
                        initial={false}
                        animate={{ rotate: isDark ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </motion.div>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Enhanced Tab Navigation */}
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <motion.div
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative overflow-hidden transition-all duration-300 ${
                          isActive 
                            ? 'bg-primary shadow-lg scale-105' 
                            : 'hover:bg-muted/80 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-medium">{tab.label}</div>
                            <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {tab.description}
                            </div>
                          </div>
                        </div>
                        
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'table' && <TableView />}
            {activeTab === 'calendar' && <CalendarView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App 