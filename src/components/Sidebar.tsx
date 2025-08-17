import React from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { PieChart, BarChart3, Calendar, Target } from 'lucide-react'

type TabId = 'dashboard' | 'table' | 'calendar' | 'goals'

interface SidebarProps {
  activeTab: TabId
  onChange: (tab: TabId) => void
}

const NAV_ITEMS: Array<{ id: TabId; label: string; icon: React.ComponentType<any>; description: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: PieChart, description: 'Overview & Analytics' },
  { id: 'table', label: 'Trades', icon: BarChart3, description: 'Trade Management' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, description: 'Daily View' },
  { id: 'goals', label: 'Goals', icon: Target, description: 'Financial Goals' },
]

export function Sidebar({ activeTab, onChange }: SidebarProps) {
  return (
    <aside aria-label="Primary" className="hidden lg:block w-64 shrink-0 pr-4">
      <Card className="border-0 shadow-sm p-2 sticky top-4">
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`justify-start h-auto py-3 px-3 rounded-md ${
                  isActive ? 'shadow-md' : 'hover:bg-muted'
                }`}
                onClick={() => onChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium leading-none">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                  </div>
                </div>
              </Button>
            )
          })}
        </nav>
      </Card>
    </aside>
  )
}

export default Sidebar


