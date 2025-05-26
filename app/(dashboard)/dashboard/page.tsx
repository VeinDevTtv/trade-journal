import { CalendarView } from "@/components/calendar-view"
import { DashboardCards } from "@/components/dashboard-cards"
import { DashboardHeader } from "@/components/dashboard-header"
import { RecentTrades } from "@/components/recent-trades"
import { NewTradeButton } from "@/components/new-trade-button"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <DashboardHeader />
        <NewTradeButton />
      </div>
      <DashboardCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CalendarView />
        <RecentTrades />
      </div>
    </div>
  )
}
