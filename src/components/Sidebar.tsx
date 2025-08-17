import React from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { PieChart, BarChart3, Calendar, Target, Zap } from 'lucide-react'

type TabId = 'dashboard' | 'table' | 'calendar' | 'goals'

interface SidebarProps {
  activeTab: TabId
  onChange: (tab: TabId) => void
}

const NAV_ITEMS: Array<{ id: TabId; label: string; icon: React.ComponentType<any>; description: string; color: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: PieChart, description: 'Overview & Analytics', color: 'text-blue-600' },
  { id: 'table', label: 'Trades', icon: BarChart3, description: 'Trade Management', color: 'text-green-600' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, description: 'Daily View', color: 'text-purple-600' },
  { id: 'goals', label: 'Goals', icon: Target, description: 'Financial Goals', color: 'text-yellow-600' },
]

export function Sidebar({ activeTab, onChange }: SidebarProps) {
  return (
    <aside aria-label="Primary" className="hidden lg:block w-64 shrink-0 pr-4">
      <Card className="border-0 shadow-xl p-4 sticky top-4 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trading Journal
          </h2>
        </div>
        
        <nav className="flex flex-col gap-2" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`justify-start h-auto py-4 px-4 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'shadow-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground scale-105' 
                    : 'hover:bg-muted hover:scale-102 hover:shadow-md'
                }`}
                onClick={() => onChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold leading-none">{item.label}</div>
                    <div className="text-xs opacity-80 mt-1">{item.description}</div>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </Button>
            )
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
          <h3 className="text-sm font-semibold text-center mb-3 text-muted-foreground">
            Quick Stats
          </h3>
          <div className="space-y-2 text-center">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Active:</span> {activeTab}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Version:</span> 2.0
            </div>
          </div>
        </div>
      </Card>
    </aside>
  )
}

export default Sidebar


