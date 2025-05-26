import { CalendarHeader } from "@/components/calendar-header"
import { TradeCalendar } from "@/components/trade-calendar"

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <CalendarHeader />
      <TradeCalendar />
    </div>
  )
}
