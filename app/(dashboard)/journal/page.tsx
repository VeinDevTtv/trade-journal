import { JournalHeader } from "@/components/journal-header"
import { TradeEntries } from "@/components/trade-entries"

export default function JournalPage() {
  return (
    <div className="flex flex-col gap-6">
      <JournalHeader />
      <TradeEntries />
    </div>
  )
}
