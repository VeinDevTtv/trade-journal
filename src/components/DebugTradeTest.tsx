import { useTradeStore } from '../store/tradeStore'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function DebugTradeTest() {
  const { addTrade, getCurrentMonthTrades, getTradeSummary } = useTradeStore()
  const trades = getCurrentMonthTrades()
  const summary = getTradeSummary()

  const testAddTrade = () => {
    const today = new Date().toISOString().split('T')[0]
    const testTrade = {
      pair: 'EURUSD',
      date: today,
      time: '10:30',
      direction: 'Long' as const,
      profitLoss: 100,
      result: 'Win' as const,
      riskReward: 2.5,
      account: 'Demo' as const,
      emotions: 'Test trade from debug component'
    }
    
    console.log('Adding test trade:', testTrade)
    addTrade(testTrade)
    console.log('Trades after add:', getCurrentMonthTrades())
  }

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800 dark:text-yellow-200">
          🧪 Debug: Trade Store Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>Total Trades: {trades.length}</p>
          <p>Total P&L: ${summary.totalProfitLoss}</p>
          <p>Win Rate: {summary.winRate.toFixed(1)}%</p>
          <Button onClick={testAddTrade} size="sm" className="mt-2">
            Add Test Trade
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}