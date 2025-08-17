import { useState } from 'react'
import { useTradeStore } from '../store/tradeStore'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Download, X, Image as ImageIcon } from 'lucide-react'
import { createStyledExport } from '../lib/exportImage'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { getCurrentMonthTrades, currentMonth } = useTradeStore()
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'png'>('csv')
  
  if (!isOpen) return null

  const trades = getCurrentMonthTrades()
  
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const headers = ['Pair', 'Date', 'Direction', 'Profit/Loss', 'Result', 'Risk/Reward', 'Account', 'Emotions']
    const csvContent = [
      headers.join(','),
      ...trades.map(trade => [
        `"${trade.pair}"`,
        trade.date,
        trade.direction,
        trade.profitLoss,
        trade.result,
        trade.riskReward,
        trade.account,
        `"${trade.emotions.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const filename = `trades-${currentMonth.year}-${currentMonth.month.toString().padStart(2, '0')}.csv`
    downloadFile(csvContent, filename, 'text/csv')
    onClose()
  }

  const exportToJSON = () => {
    const exportData = {
      month: currentMonth,
      trades,
      exportDate: new Date().toISOString(),
      summary: {
        totalTrades: trades.length,
        totalProfitLoss: trades.reduce((sum, t) => sum + t.profitLoss, 0),
        totalRiskReward: trades.reduce((sum, t) => sum + t.riskReward, 0),
        winRate: trades.length > 0 ? (trades.filter(t => t.result === 'Win').length / trades.length) * 100 : 0
      }
    }

    const filename = `trades-${currentMonth.year}-${currentMonth.month.toString().padStart(2, '0')}.json`
    downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json')
    onClose()
  }

  const exportToPNG = async () => {
    try {
      const totalProfitLoss = trades.reduce((sum, t) => sum + t.profitLoss, 0)
      const winRate = trades.length > 0 ? (trades.filter(t => t.result === 'Win').length / trades.length) * 100 : 0
      const totalRiskReward = trades.reduce((sum, t) => sum + t.riskReward, 0)
      
      const exportData = {
        title: 'Monthly Trading Summary',
        subtitle: `${currentMonth.year} - ${currentMonth.month.toString().padStart(2, '0')}`,
        data: {
          totalTrades: trades.length,
          winningTrades: trades.filter(t => t.result === 'Win').length,
          losingTrades: trades.filter(t => t.result === 'Loss').length,
          winRate: winRate,
          totalPnL: totalProfitLoss,
          avgRiskReward: totalRiskReward / trades.length || 0
        },
        type: 'table' as const
      }

      await createStyledExport(exportData, {
        fileName: `trades-summary-${currentMonth.year}-${currentMonth.month.toString().padStart(2, '0')}.png`,
        scale: 3,
        quality: 1.0
      })
      
      onClose()
    } catch (error) {
      console.error('PNG export failed:', error)
      // You could add a toast notification here
    }
  }

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV()
    } else if (exportFormat === 'json') {
      exportToJSON()
    } else if (exportFormat === 'png') {
      exportToPNG()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Export Trades</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Export {trades.length} trades from {currentMonth.year}-{currentMonth.month.toString().padStart(2, '0')}
            </p>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="w-4 h-4"
                />
                <span>CSV - Spreadsheet format</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                  className="w-4 h-4"
                />
                <span>JSON - Data format with summary</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={exportFormat === 'png'}
                  onChange={() => setExportFormat('png')}
                  className="w-4 h-4"
                />
                <span>PNG - High-quality image summary</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex-1 flex items-center gap-2">
              {exportFormat === 'png' ? <ImageIcon className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              Export {exportFormat.toUpperCase()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 