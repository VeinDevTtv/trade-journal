import { AnalyticsHeader } from "@/components/analytics-header"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { PerformanceCharts } from "@/components/performance-charts"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AnalyticsHeader />
      <PerformanceMetrics />
      <PerformanceCharts />
    </div>
  )
}
