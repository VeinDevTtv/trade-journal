import { useEffect, useMemo, useState } from 'react'
import { useTradeStore } from '../store/tradeStore'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Download, Upload, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

type ImportFormat = 'csv' | 'json'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ParsedTradeRow {
  pair: string
  date: string
  time?: string
  direction: 'Long' | 'Short' | '-'
  profitLoss: number
  result: 'Win' | 'Loss' | 'Breakeven'
  riskReward: number
  account: 'Funded' | 'Demo' | 'Personal'
  emotions: string
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { addTrade, currentMonth } = useTradeStore()
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ImportFormat>('csv')
  const [previewRows, setPreviewRows] = useState<ParsedTradeRow[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [skipHeader, setSkipHeader] = useState(true)
  const [onlyCurrentMonth, setOnlyCurrentMonth] = useState(true)

  useEffect(() => {
    if (!isOpen) {
      setFile(null)
      setPreviewRows([])
      setIsParsing(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const readFileText = (fileToRead: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = reject
      reader.readAsText(fileToRead)
    })
  }

  const parseCSV = (text: string): ParsedTradeRow[] => {
    // Robust-enough CSV parser for our own exported CSV with quoted fields
    const rows: string[][] = []
    let current: string[] = []
    let value = ''
    let insideQuotes = false

    const pushValue = () => {
      current.push(value)
      value = ''
    }

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const next = text[i + 1]
      if (char === '"') {
        if (insideQuotes && next === '"') {
          // Escaped quote
          value += '"'
          i++
        } else {
          insideQuotes = !insideQuotes
        }
      } else if (char === ',' && !insideQuotes) {
        pushValue()
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        // End of line
        if (value.length > 0 || current.length > 0) {
          pushValue()
          rows.push(current)
          current = []
        }
        // swallow consecutive CRLF
      } else {
        value += char
      }
    }
    if (value.length > 0 || current.length > 0) {
      pushValue()
      rows.push(current)
    }

    // Optionally skip header
    const startIndex = skipHeader ? 1 : 0

    const parsed: ParsedTradeRow[] = []
    for (let r = startIndex; r < rows.length; r++) {
      const cols = rows[r]
      if (!cols || cols.length < 8) continue
      const [pair, date, direction, profitLoss, result, riskReward, account, emotions] = cols
      const normalized: ParsedTradeRow = {
        pair: (pair || '').replace(/^"|"$/g, ''),
        date: date || '',
        time: undefined,
        direction: (direction as ParsedTradeRow['direction']) || '-',
        profitLoss: Number(profitLoss || 0),
        result: (result as ParsedTradeRow['result']) || 'Breakeven',
        riskReward: Number(riskReward || 0),
        account: (account as ParsedTradeRow['account']) || 'Demo',
        emotions: (emotions || '').replace(/^"|"$/g, '').replace(/""/g, '"'),
      }
      parsed.push(normalized)
    }
    return parsed
  }

  const parseJSON = (text: string): ParsedTradeRow[] => {
    try {
      const data = JSON.parse(text)
      // Support our exported structure: { month, trades, ... }
      if (Array.isArray(data)) {
        return data as ParsedTradeRow[]
      } else if (Array.isArray(data?.trades)) {
        return (data.trades as any[]).map((t) => ({
          pair: t.pair || '',
          date: t.date || '',
          time: t.time || undefined,
          direction: (t.direction as ParsedTradeRow['direction']) || '-',
          profitLoss: Number(t.profitLoss || 0),
          result: (t.result as ParsedTradeRow['result']) || 'Breakeven',
          riskReward: Number(t.riskReward || 0),
          account: (t.account as ParsedTradeRow['account']) || 'Demo',
          emotions: t.emotions || '',
        }))
      }
      return []
    } catch {
      return []
    }
  }

  const handleParse = async () => {
    if (!file) return
    setIsParsing(true)
    try {
      const text = await readFileText(file)
      const rows = format === 'csv' ? parseCSV(text) : parseJSON(text)
      const filtered = onlyCurrentMonth
        ? rows.filter((r) => {
            if (!r.date) return false
            const d = new Date(r.date)
            return (
              d.getFullYear() === currentMonth.year && d.getMonth() + 1 === currentMonth.month
            )
          })
        : rows
      setPreviewRows(filtered)
      toast.success(`Parsed ${filtered.length} trades`)
    } catch (e) {
      toast.error('Failed to parse file')
    } finally {
      setIsParsing(false)
    }
  }

  const handleImport = () => {
    if (previewRows.length === 0) {
      toast('No rows to import')
      return
    }
    let imported = 0
    previewRows.forEach((row) => {
      addTrade({
        pair: row.pair || '',
        date: row.date,
        time: row.time || '',
        direction: row.direction,
        profitLoss: Number(row.profitLoss || 0),
        result: row.result,
        riskReward: Number(row.riskReward || 0),
        account: row.account,
        emotions: row.emotions || '',
      })
      imported++
    })
    toast.success(`Imported ${imported} trades`)
    onClose()
  }

  const exampleText = useMemo(
    () =>
      'CSV headers (from Export):\nPair,Date,Direction,Profit/Loss,Result,Risk/Reward,Account,Emotions',
    []
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-xl mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Trades
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Import trades from a CSV or JSON file. Best used with files exported by this app.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept={format === 'csv' ? '.csv,text/csv' : '.json,application/json'}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={format === 'csv'}
                    onChange={() => setFormat('csv')}
                  />
                  CSV
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={format === 'json'}
                    onChange={() => setFormat('json')}
                  />
                  JSON
                </label>
              </div>
            </div>
            {format === 'csv' && (
              <div className="flex flex-wrap gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={skipHeader}
                    onChange={(e) => setSkipHeader(e.target.checked)}
                  />
                  Skip header row
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={onlyCurrentMonth}
                    onChange={(e) => setOnlyCurrentMonth(e.target.checked)}
                  />
                  Only import current month
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleParse}
              disabled={!file || isParsing}
              className="flex-1"
            >
              Parse
            </Button>
            <Button onClick={handleImport} disabled={previewRows.length === 0} className="flex-1 flex items-center gap-2">
              <Download className="h-4 w-4" /> Import {previewRows.length}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
            {exampleText}
          </div>

          {/* Preview */}
          <div className="max-h-48 overflow-auto border rounded-md">
            {previewRows.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4">No preview yet</div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-left">
                    <th className="p-2">Pair</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Direction</th>
                    <th className="p-2">P&L</th>
                    <th className="p-2">Result</th>
                    <th className="p-2">R:R</th>
                    <th className="p-2">Account</th>
                    <th className="p-2">Emotions</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 50).map((r, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{r.pair}</td>
                      <td className="p-2">{r.date}</td>
                      <td className="p-2">{r.direction}</td>
                      <td className="p-2">{r.profitLoss}</td>
                      <td className="p-2">{r.result}</td>
                      <td className="p-2">{r.riskReward}</td>
                      <td className="p-2">{r.account}</td>
                      <td className="p-2">{r.emotions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


