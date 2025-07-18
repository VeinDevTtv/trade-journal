import React, { useState } from 'react'
import { useTradeStore } from './store/tradeStore'
import { TableView } from './components/TableView'
import { CalendarView } from './components/CalendarView'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { BarChart3, Calendar, Moon, Sun } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'table' | 'calendar'>('table')
  const [isDark, setIsDark] = useState(false)
  const { currentMonth, setCurrentMonth } = useTradeStore()

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (isDark) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold">Trade Journal</CardTitle>
              <div className="flex items-center gap-4">
                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    ←
                  </Button>
                  <span className="min-w-[120px] text-center font-medium">
                    {monthNames[currentMonth.month - 1]} {currentMonth.year}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    →
                  </Button>
                </div>
                
                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tab Navigation */}
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'table' ? 'default' : 'outline'}
                onClick={() => setActiveTab('table')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                📊 Table View
              </Button>
              <Button
                variant={activeTab === 'calendar' ? 'default' : 'outline'}
                onClick={() => setActiveTab('calendar')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                🗓️ Calendar View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {activeTab === 'table' ? <TableView /> : <CalendarView />}
      </div>
    </div>
  )
}

export default App 