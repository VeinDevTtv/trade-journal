import { TradeProfitCalculator } from "@/components/trade-profit-calculator"

export default function CalculatorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trade Calculator</h1>
        <p className="text-muted-foreground">Calculate profit/loss and position size for your trades</p>
      </div>
      <TradeProfitCalculator />
    </div>
  )
}
