import React, { useState } from 'react'
import { useTradeStore } from '../store/tradeStore'
import { Trade } from '../types/trade'
import { formatCurrency } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Plus, Trash2, Download } from 'lucide-react'
import { ExportModal } from './ExportModal'
import { TradingInsights } from './TradingInsights'

export function TableView() {
  const { 
    getCurrentMonthTrades, 
    getTradeSummary, 
    addTrade, 
    updateTrade, 
    deleteTrade 
  } = useTradeStore()
  
  const trades = getCurrentMonthTrades()
  const summary = getTradeSummary()
  const [editingCell, setEditingCell] = useState<{tradeId: string, field: string} | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)

  const addNewTrade = () => {
    const today = new Date().toISOString().split('T')[0]
    addTrade({
      pair: '',
      date: today,
      direction: '-',
      profitLoss: 0,
      result: 'Breakeven',
      riskReward: 0,
      account: 'Demo',
      emotions: ''
    })
  }

  const handleCellEdit = (tradeId: string, field: keyof Trade, value: any) => {
    updateTrade(tradeId, { [field]: value })
    setEditingCell(null)
  }

  const EditableCell = ({ 
    trade, 
    field, 
    type = 'text',
    options 
  }: { 
    trade: Trade
    field: keyof Trade
    type?: 'text' | 'number' | 'date' | 'select'
    options?: string[]
  }) => {
    const isEditing = editingCell?.tradeId === trade.id && editingCell?.field === field
    const value = trade[field]

    if (isEditing) {
      if (type === 'select' && options) {
        return (
          <Select
            value={value as string}
            onValueChange={(newValue) => handleCellEdit(trade.id, field, newValue)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }

      return (
        <Input
          type={type}
          value={value as string | number}
          onChange={(e) => {
            const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
            handleCellEdit(trade.id, field, newValue)
          }}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditingCell(null)
            }
          }}
          className="h-8"
          autoFocus
        />
      )
    }

    const displayValue = type === 'number' && field === 'profitLoss' 
      ? formatCurrency(value as number)
      : value

    return (
      <div
        className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 min-h-[32px] flex items-center"
        onClick={() => setEditingCell({ tradeId: trade.id, field })}
      >
        {displayValue || <span className="text-muted-foreground">Click to edit</span>}
      </div>
    )
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win': return 'text-green-600'
      case 'Loss': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Trade Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Trading Table</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowExportModal(true)} 
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={addNewTrade} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Trade
          </Button>
        </div>
      </div>

      {/* Trade Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pair</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>R:R</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Emotions</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    <EditableCell trade={trade} field="pair" />
                  </TableCell>
                  <TableCell>
                    <EditableCell trade={trade} field="date" type="date" />
                  </TableCell>
                  <TableCell>
                    <EditableCell 
                      trade={trade} 
                      field="direction" 
                      type="select"
                      options={['Long', 'Short', '-']}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell trade={trade} field="profitLoss" type="number" />
                  </TableCell>
                  <TableCell>
                    <div className={getResultColor(trade.result)}>
                      <EditableCell 
                        trade={trade} 
                        field="result" 
                        type="select"
                        options={['Win', 'Loss', 'Breakeven']}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <EditableCell trade={trade} field="riskReward" type="number" />
                  </TableCell>
                  <TableCell>
                    <EditableCell 
                      trade={trade} 
                      field="account" 
                      type="select"
                      options={['Funded', 'Demo', 'Personal']}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell trade={trade} field="emotions" />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTrade(trade.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {trades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No trades this month. Click "Add Trade" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalProfitLoss)}
              </div>
              <div className="text-sm text-muted-foreground">Total P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {summary.totalRiskReward.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total R:R</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {summary.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {summary.totalTrades}
              </div>
              <div className="text-sm text-muted-foreground">Total Trades</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Insights */}
      <TradingInsights />

      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
    </div>
  )
} 