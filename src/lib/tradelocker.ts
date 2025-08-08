// TradeLocker integration helper
// Note: In production, never keep client secrets in the browser. This module uses
// a public-auth token flow if TradeLocker supports CORS for public endpoints.
// Otherwise, proxy these calls through a backend.

export interface TradeLockerCredentials {
  email: string
  password: string
}

export interface TradeLockerAuth {
  accessToken: string
  refreshToken?: string
}

export interface TradeLockerAccount {
  id: string
  name?: string
  number?: string
}

export interface TradeLockerFilledTrade {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  pnl: number
  rr?: number
  openTime?: string
  closeTime?: string
  accountId: string
}

const BASE_URL = (import.meta as any)?.env?.VITE_TRADELOCKER_BASE_URL || 'https://public-api.tradelocker.com'

export async function loginWithCredentials(creds: TradeLockerCredentials): Promise<TradeLockerAuth> {
  const res = await fetch(`${BASE_URL}/auth/jwt/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: creds.email, password: creds.password })
  })
  if (!res.ok) throw new Error('TradeLocker auth failed')
  const data = await res.json()
  return { accessToken: data?.token || data?.accessToken, refreshToken: data?.refreshToken }
}

export async function getAccounts(auth: TradeLockerAuth): Promise<TradeLockerAccount[]> {
  const res = await fetch(`${BASE_URL}/auth/jwt/all-accounts`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` }
  })
  if (!res.ok) throw new Error('Failed to fetch accounts')
  const data = await res.json()
  // Normalize
  return (Array.isArray(data) ? data : data?.accounts || []).map((a: any) => ({
    id: String(a?.id ?? a?.accountId ?? a?.accNum ?? a?.number),
    name: a?.name,
    number: String(a?.accNum ?? a?.number ?? a?.id)
  }))
}

export async function getHistoricalTrades(
  auth: TradeLockerAuth,
  accountId: string,
  params?: { from?: string; to?: string }
): Promise<TradeLockerFilledTrade[]> {
  // Endpoint guessed from web search summary. Adjust if docs differ.
  const url = new URL(`${BASE_URL}/trade/accounts/${accountId}/orders`)
  if (params?.from) url.searchParams.set('from', params.from)
  if (params?.to) url.searchParams.set('to', params.to)
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${auth.accessToken}` }
  })
  if (!res.ok) throw new Error('Failed to fetch orders')
  const data = await res.json()

  // Map to filled trades; filter only filled/closed orders
  const items = Array.isArray(data) ? data : data?.orders || []
  return items
    .filter((o: any) => (o?.status || '').toLowerCase().includes('filled') || (o?.isClosed ?? true))
    .map((o: any) => ({
      id: String(o?.id ?? o?.orderId),
      symbol: o?.symbol || o?.ticker || '',
      side: (o?.side || '').toUpperCase() === 'BUY' ? 'BUY' : 'SELL',
      pnl: Number(o?.pnl ?? o?.profit ?? 0),
      rr: o?.rr ? Number(o.rr) : undefined,
      openTime: o?.openTime || o?.createdAt || o?.time,
      closeTime: o?.closeTime || o?.closedAt,
      accountId
    }))
}

export function mapTradeLockerToLocal(t: TradeLockerFilledTrade) {
  // Heuristic mapping to our Trade type
  const direction = t.side === 'BUY' ? 'Long' : 'Short'
  const date = (t.closeTime || t.openTime || new Date().toISOString()).slice(0, 10)
  return {
    pair: t.symbol,
    date,
    time: (t.closeTime || t.openTime || '').slice(11, 16),
    direction,
    profitLoss: Number(t.pnl || 0),
    result: Number(t.pnl || 0) > 0 ? 'Win' : Number(t.pnl || 0) < 0 ? 'Loss' : 'Breakeven' as const,
    riskReward: typeof t.rr === 'number' ? t.rr : 0,
    account: 'Personal' as const,
    emotions: '',
    source: 'TradeLocker',
    externalId: t.id,
    brokerAccount: t.accountId,
    openTime: t.openTime,
    closeTime: t.closeTime,
  }
}


