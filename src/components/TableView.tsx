import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
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
import { 
  Plus, 
  Trash2, 
  Download, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  TrendingUp,
  TrendingDown,
  Copy,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react'
import { ExportModal } from './ExportModal'
import { TradingInsights } from './TradingInsights'

type SortField = 'date' | 'profitLoss' | 'riskReward' | 'pair'
type SortDirection = 'asc' | 'desc'

export function TableView() {
  const { trades, currentMonth, addTrade, updateTrade, deleteTrade } = useTradeStore()
  
  // Calculate current month trades reactively
  const allTrades = useMemo(() => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date)
      return tradeDate.getFullYear() === currentMonth.year &&
             tradeDate.getMonth() + 1 === currentMonth.month
    })
  }, [trades, currentMonth])
  
  // Calculate summary reactively
  const summary = useMemo(() => {
    const totalProfitLoss = allTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)
    const totalRiskReward = allTrades.reduce((sum, trade) => sum + trade.riskReward, 0)
    const winningTrades = allTrades.filter(trade => trade.result === 'Win').length
    const winRate = allTrades.length > 0 ? (winningTrades / allTrades.length) * 100 : 0
    
    return {
      totalProfitLoss,
      totalRiskReward,
      winRate,
      totalTrades: allTrades.length
    }
  }, [allTrades])
  
  const [editingCell, setEditingCell] = useState<{tradeId: string, field: string} | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterResult, setFilterResult] = useState<'all' | 'Win' | 'Loss' | 'Breakeven'>('all')
  const [filterAccount, setFilterAccount] = useState<'all' | 'Funded' | 'Demo' | 'Personal'>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [bulkSelect, setBulkSelect] = useState<string[]>([])

  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    let filtered = allTrades.filter(trade => {
      // Search filter
      const searchMatch = !searchQuery || 
        trade.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.emotions.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.date.includes(searchQuery)

      // Result filter
      const resultMatch = filterResult === 'all' || trade.result === filterResult

      // Account filter
      const accountMatch = filterAccount === 'all' || trade.account === filterAccount

      return searchMatch && resultMatch && accountMatch
    })

    // Sort trades
    filtered.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      if (sortField === 'date') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [allTrades, searchQuery, filterResult, filterAccount, sortField, sortDirection])

  const addNewTrade = () => {
    const today = new Date().toISOString().split('T')[0]
    const newTrade = {
      pair: '',
      date: today,
      time: '',
      direction: '-' as const,
      profitLoss: 0,
      result: 'Breakeven' as const,
      riskReward: 0,
      account: 'Demo' as const,
      emotions: ''
    }
    
    addTrade(newTrade)
    toast.success('New trade added successfully!')
  }

  const duplicateTrade = (trade: Trade) => {
    const today = new Date().toISOString().split('T')[0]
    const duplicatedTrade = {
      ...trade,
      date: today,
      id: undefined as any // Will be generated
    }
    delete duplicatedTrade.id
    addTrade(duplicatedTrade)
    toast.success(`Trade duplicated for today!`)
  }

  const deleteBulkTrades = () => {
    if (bulkSelect.length === 0) return
    
    bulkSelect.forEach(tradeId => deleteTrade(tradeId))
    setBulkSelect([])
    toast.success(`${bulkSelect.length} trades deleted successfully!`)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }



  const EditableCell = ({ 
    trade, 
    field, 
    type = 'text',
    options,
    placeholder
  }: { 
    trade: Trade
    field: keyof Trade
    type?: 'text' | 'number' | 'date' | 'select' | 'time'
    options?: string[]
    placeholder?: string
  }) => {
    const isEditing = editingCell?.tradeId === trade.id && editingCell?.field === field
    const [tempValue, setTempValue] = useState(trade[field] as string | number)
    const value = trade[field]

    // Update tempValue when trade value changes or when starting to edit
    React.useEffect(() => {
      if (isEditing) {
        setTempValue(trade[field] as string | number)
      }
    }, [isEditing, trade[field]])

    const handleSave = () => {
      const finalValue = type === 'number' ? (parseFloat(tempValue as string) || 0) : tempValue
      updateTrade(trade.id, { [field]: finalValue })
      setEditingCell(null)
      toast.success('Trade updated successfully!')
    }

    const handleCancel = () => {
      setTempValue(trade[field] as string | number)
      setEditingCell(null)
    }

    if (isEditing) {
      if (type === 'select' && options) {
        return (
          <Select
            value={value as string}
            onValueChange={(newValue) => {
              updateTrade(trade.id, { [field]: newValue })
              setEditingCell(null)
              toast.success('Trade updated successfully!')
            }}
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
          value={tempValue}
          placeholder={placeholder}
          onChange={(e) => {
            setTempValue(e.target.value)
          }}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            } else if (e.key === 'Escape') {
              handleCancel()
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
        className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 min-h-[32px] flex items-center group transition-colors"
        onClick={() => setEditingCell({ tradeId: trade.id, field })}
      >
        <span className={!displayValue ? 'text-muted-foreground' : ''}>
          {displayValue || 'Click to edit'}
        </span>
        <Edit3 className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    )
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'Loss': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default: return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    }
  }

  const SortableHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <SortAsc className="h-4 w-4" /> : 
            <SortDesc className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Trade Management</h2>
            <p className="text-muted-foreground">Manage and analyze your trading performance</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {bulkSelect.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={deleteBulkTrades}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {bulkSelect.length}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBulkSelect([])}
                >
                  Clear
                </Button>
              </motion.div>
            )}
            
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

        {/* Search and Filter Bar */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trades by pair, date, or emotions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Filters
              </Button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="text-sm font-medium mb-2 block">Result</label>
                    <Select value={filterResult} onValueChange={(value: any) => setFilterResult(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Results</SelectItem>
                        <SelectItem value="Win">Wins Only</SelectItem>
                        <SelectItem value="Loss">Losses Only</SelectItem>
                        <SelectItem value="Breakeven">Breakeven Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Account</label>
                    <Select value={filterAccount} onValueChange={(value: any) => setFilterAccount(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Accounts</SelectItem>
                        <SelectItem value="Funded">Funded</SelectItem>
                        <SelectItem value="Demo">Demo</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('')
                        setFilterResult('all')
                        setFilterAccount('all')
                        toast.success('Filters cleared!')
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Trade Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={bulkSelect.length === filteredTrades.length && filteredTrades.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelect(filteredTrades.map(t => t.id))
                          } else {
                            setBulkSelect([])
                          }
                        }}
                        className="rounded"
                      />
                    </TableHead>
                    <SortableHeader field="pair">Pair</SortableHeader>
                    <SortableHeader field="date">Date</SortableHeader>
                    <TableHead>Time</TableHead>
                    <TableHead>Direction</TableHead>
                    <SortableHeader field="profitLoss">P&L</SortableHeader>
                    <TableHead>Result</TableHead>
                    <SortableHeader field="riskReward">R:R</SortableHeader>
                    <TableHead>Account</TableHead>
                    <TableHead>Emotions</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredTrades.map((trade, index) => (
                      <motion.tr
                        key={trade.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={bulkSelect.includes(trade.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelect([...bulkSelect, trade.id])
                              } else {
                                setBulkSelect(bulkSelect.filter(id => id !== trade.id))
                              }
                            }}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <EditableCell trade={trade} field="pair" />
                        </TableCell>
                        <TableCell>
                          <EditableCell trade={trade} field="date" type="date" />
                        </TableCell>
                        <TableCell>
                          <EditableCell trade={trade} field="time" type="time" placeholder="HH:mm" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {trade.direction === 'Long' && <TrendingUp className="h-4 w-4 text-green-600" />}
                            {trade.direction === 'Short' && <TrendingDown className="h-4 w-4 text-red-600" />}
                            <EditableCell 
                              trade={trade} 
                              field="direction" 
                              type="select"
                              options={['Long', 'Short', '-']}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <EditableCell trade={trade} field="profitLoss" type="number" />
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResultColor(trade.result)}`}>
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
                        <TableCell className="max-w-xs">
                          <EditableCell trade={trade} field="emotions" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateTrade(trade)}
                              className="h-8 w-8 hover:bg-muted"
                              title="Duplicate trade"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                deleteTrade(trade.id)
                                toast.success('Trade deleted successfully!')
                              }}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete trade"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  
                  {filteredTrades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-12">
                        <div className="space-y-2">
                          <p className="text-lg">No trades found</p>
                          <p className="text-sm">
                            {searchQuery || filterResult !== 'all' || filterAccount !== 'all' 
                              ? 'Try adjusting your search or filters' 
                              : 'Click "Add Trade" to get started'
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className={`text-3xl font-bold ${summary.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.totalProfitLoss)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total P&L</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {summary.totalRiskReward.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total R:R</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {summary.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Win Rate</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {summary.totalTrades}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Trades</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trading Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <TradingInsights />
      </motion.div>

      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
    </div>
  )
} 