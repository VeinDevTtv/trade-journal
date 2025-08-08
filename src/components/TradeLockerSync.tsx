import { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { Download, LogIn, RefreshCw } from 'lucide-react'
import { loginWithCredentials, getAccounts, getHistoricalTrades, mapTradeLockerToLocal, TradeLockerAuth } from '../lib/tradelocker'
import { useTradeStore } from '../store/tradeStore'

export function TradeLockerSync() {
  const { bulkUpsertTrades } = useTradeStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [auth, setAuth] = useState<TradeLockerAuth | null>(null)
  const [accounts, setAccounts] = useState<Array<{ id: string; name?: string; number?: string }>>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [isBusy, setIsBusy] = useState(false)
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [autoSync, setAutoSync] = useState<boolean>(false)

  useEffect(() => {
    const saved = localStorage.getItem('tradelocker.auth')
    if (saved) {
      try { setAuth(JSON.parse(saved)) } catch {}
    }
    const acc = localStorage.getItem('tradelocker.account')
    if (acc) setSelectedAccount(acc)
    const as = localStorage.getItem('tradelocker.autoSync')
    if (as) setAutoSync(as === 'true')
    const df = localStorage.getItem('tradelocker.from')
    const dt = localStorage.getItem('tradelocker.to')
    if (df) setDateFrom(df)
    if (dt) setDateTo(dt)
  }, [])

  useEffect(() => {
    if (auth) localStorage.setItem('tradelocker.auth', JSON.stringify(auth))
  }, [auth])

  useEffect(() => {
    if (selectedAccount) localStorage.setItem('tradelocker.account', selectedAccount)
  }, [selectedAccount])

  useEffect(() => {
    localStorage.setItem('tradelocker.autoSync', String(autoSync))
  }, [autoSync])

  useEffect(() => {
    localStorage.setItem('tradelocker.from', dateFrom)
  }, [dateFrom])

  useEffect(() => {
    localStorage.setItem('tradelocker.to', dateTo)
  }, [dateTo])

  const canLogin = useMemo(() => email.length > 3 && password.length > 3, [email, password])

  const handleLogin = async () => {
    try {
      setIsBusy(true)
      const a = await loginWithCredentials({ email, password })
      setAuth(a)
      toast.success('Connected to TradeLocker')
      const list = await getAccounts(a)
      setAccounts(list)
      if (list[0]?.id) setSelectedAccount(list[0].id)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to connect')
    } finally {
      setIsBusy(false)
    }
  }

  const handleFetchAccounts = async () => {
    if (!auth) return
    try {
      setIsBusy(true)
      const list = await getAccounts(auth)
      setAccounts(list)
      if (list[0]?.id) setSelectedAccount(list[0].id)
    } catch (e: any) {
      toast.error(e?.message || 'Failed fetching accounts')
    } finally {
      setIsBusy(false)
    }
  }

  const handleSync = async () => {
    if (!auth || !selectedAccount) {
      toast('Connect and select account first')
      return
    }
    try {
      setIsBusy(true)
      const trades = await getHistoricalTrades(auth, selectedAccount, {
        from: dateFrom || undefined,
        to: dateTo || undefined,
      })
      const mapped = trades.map(mapTradeLockerToLocal)
      const { added, updated } = bulkUpsertTrades(mapped)
      toast.success(`Synced ${added} new, ${updated} updated`)
    } catch (e: any) {
      toast.error(e?.message || 'Sync failed')
    } finally {
      setIsBusy(false)
    }
  }

  // Auto sync interval
  useEffect(() => {
    if (!autoSync || !auth || !selectedAccount) return
    const id = setInterval(() => {
      handleSync()
    }, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(id)
  }, [autoSync, auth, selectedAccount, dateFrom, dateTo])

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          TradeLocker Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!auth && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="TradeLocker Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={handleLogin} disabled={!canLogin || isBusy} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Connect
            </Button>
          </div>
        )}

        {auth && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Button variant="outline" onClick={handleFetchAccounts} disabled={isBusy} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Accounts
              </Button>
              <select
                className="border rounded-md h-10 px-2 text-sm"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.number || a.id} {a.name ? `• ${a.name}` : ''}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
              <div className="flex gap-2">
                <Button onClick={handleSync} disabled={isBusy || !selectedAccount} className="flex-1 flex items-center gap-2">
                  <Download className="h-4 w-4" /> Sync Trades
                </Button>
                <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                  <input type="checkbox" checked={autoSync} onChange={(e) => setAutoSync(e.target.checked)} />
                  Auto sync
                </label>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Note: If TradeLocker API requires a backend proxy for CORS or secret handling, configure one and point this app to it.
        </p>
      </CardContent>
    </Card>
  )
}


