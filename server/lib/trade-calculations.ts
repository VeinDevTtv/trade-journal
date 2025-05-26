/**
 * Utility functions for trade calculations
 */

// Standard lot size in units
const STANDARD_LOT_SIZE = 100000
const MINI_LOT_SIZE = 10000
const MICRO_LOT_SIZE = 1000

// Currency pair information with pip values and decimal places
export interface CurrencyPairInfo {
  symbol: string
  pipDecimalPlace: number
  usdIsQuote: boolean
  usdIsBase: boolean
}

// Map of currency pairs with their properties
export const currencyPairsInfo: Record<string, CurrencyPairInfo> = {
  // Major Currency Pairs
  EURUSD: { symbol: "EURUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false },
  GBPUSD: { symbol: "GBPUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false },
  AUDUSD: { symbol: "AUDUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false },
  NZDUSD: { symbol: "NZDUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false },
  USDJPY: { symbol: "USDJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: true },
  USDCAD: { symbol: "USDCAD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDCHF: { symbol: "USDCHF", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },

  // Minor Currency Pairs (Cross Pairs)
  EURJPY: { symbol: "EURJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: false },
  GBPJPY: { symbol: "GBPJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: false },
  EURGBP: { symbol: "EURGBP", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  AUDCAD: { symbol: "AUDCAD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  AUDNZD: { symbol: "AUDNZD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  EURAUD: { symbol: "EURAUD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  EURNZD: { symbol: "EURNZD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  EURCAD: { symbol: "EURCAD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  EURCHF: { symbol: "EURCHF", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  GBPAUD: { symbol: "GBPAUD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  GBPNZD: { symbol: "GBPNZD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  GBPCAD: { symbol: "GBPCAD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  GBPCHF: { symbol: "GBPCHF", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  AUDCHF: { symbol: "AUDCHF", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  AUDJPY: { symbol: "AUDJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: false },
  NZDJPY: { symbol: "NZDJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: false },
  NZDCAD: { symbol: "NZDCAD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  NZDCHF: { symbol: "NZDCHF", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  CADJPY: { symbol: "CADJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: false },
  CADCHF: { symbol: "CADCHF", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
  CHFJPY: { symbol: "CHFJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: false },

  // Exotic Currency Pairs
  USDSEK: { symbol: "USDSEK", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDNOK: { symbol: "USDNOK", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDDKK: { symbol: "USDDKK", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDPLN: { symbol: "USDPLN", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDHUF: { symbol: "USDHUF", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: true },
  USDCZK: { symbol: "USDCZK", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDTRY: { symbol: "USDTRY", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDZAR: { symbol: "USDZAR", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDMXN: { symbol: "USDMXN", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDSGD: { symbol: "USDSGD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
  USDHKD: { symbol: "USDHKD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },

  // Stock Indices (CFDs)
  US30: { symbol: "US30", pipDecimalPlace: 0, usdIsQuote: true, usdIsBase: false }, // Dow Jones
  SPX500: { symbol: "SPX500", pipDecimalPlace: 1, usdIsQuote: true, usdIsBase: false }, // S&P 500
  NAS100: { symbol: "NAS100", pipDecimalPlace: 1, usdIsQuote: true, usdIsBase: false }, // NASDAQ 100
  UK100: { symbol: "UK100", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // FTSE 100
  GER40: { symbol: "GER40", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // DAX 40
  FRA40: { symbol: "FRA40", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // CAC 40
  ESP35: { symbol: "ESP35", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // IBEX 35
  ITA40: { symbol: "ITA40", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // FTSE MIB
  AUS200: { symbol: "AUS200", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // ASX 200
  JPN225: { symbol: "JPN225", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // Nikkei 225
  HK50: { symbol: "HK50", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // Hang Seng
  CHINA50: { symbol: "CHINA50", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // China A50
  EUSTX50: { symbol: "EUSTX50", pipDecimalPlace: 0, usdIsQuote: false, usdIsBase: false }, // Euro Stoxx 50
  
  // Commodities
  XAUUSD: { symbol: "XAUUSD", pipDecimalPlace: 2, usdIsQuote: true, usdIsBase: false }, // Gold
  XAGUSD: { symbol: "XAGUSD", pipDecimalPlace: 3, usdIsQuote: true, usdIsBase: false }, // Silver
  XPTUSD: { symbol: "XPTUSD", pipDecimalPlace: 2, usdIsQuote: true, usdIsBase: false }, // Platinum
  XPDUSD: { symbol: "XPDUSD", pipDecimalPlace: 2, usdIsQuote: true, usdIsBase: false }, // Palladium
  USOIL: { symbol: "USOIL", pipDecimalPlace: 2, usdIsQuote: true, usdIsBase: false }, // WTI Crude Oil
  UKOIL: { symbol: "UKOIL", pipDecimalPlace: 2, usdIsQuote: true, usdIsBase: false }, // Brent Crude Oil
  NATGAS: { symbol: "NATGAS", pipDecimalPlace: 3, usdIsQuote: true, usdIsBase: false }, // Natural Gas

  // Cryptocurrencies (Major)
  BTCUSD: { symbol: "BTCUSD", pipDecimalPlace: 2, usdIsQuote: true, usdIsBase: false }, // Bitcoin
  ETHUSD: { symbol: "ETHUSD", pipDecimalPlace: 2, usdIsQuote: true, usdIsBase: false }, // Ethereum
  LTCUSD: { symbol: "LTCUSD", pipDecimalPlace: 2, usdIsQuote: true, usdIsBase: false }, // Litecoin
  XRPUSD: { symbol: "XRPUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false }, // Ripple
  ADAUSD: { symbol: "ADAUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false }, // Cardano
  DOTUSD: { symbol: "DOTUSD", pipDecimalPlace: 3, usdIsQuote: true, usdIsBase: false }, // Polkadot
  LINKUSD: { symbol: "LINKUSD", pipDecimalPlace: 3, usdIsQuote: true, usdIsBase: false }, // Chainlink
  SOLUSD: { symbol: "SOLUSD", pipDecimalPlace: 2, usdIsQuote: true, usdIsBase: false }, // Solana
}

// Get pip value for a currency pair
export function getPipValue(symbol: string): number {
  const pairInfo = currencyPairsInfo[symbol]
  if (!pairInfo) return 0.0001 // Default to 4 decimal places if pair not found

  return Math.pow(10, -pairInfo.pipDecimalPlace)
}

// Calculate number of pips between two prices
export function calculatePips(symbol: string, entryPrice: number, exitPrice: number): number {
  const pipValue = getPipValue(symbol)
  const pairInfo = currencyPairsInfo[symbol]

  if (!pairInfo) {
    // Default calculation if pair not found
    return (exitPrice - entryPrice) / pipValue
  }

  // For JPY pairs (2 decimal places), multiply by 100 to get standard pips
  if (pairInfo.pipDecimalPlace === 2) {
    return (exitPrice - entryPrice) / pipValue
  }

  return (exitPrice - entryPrice) / pipValue
}

// Get the conversion rate to USD for calculating profit in USD
export async function getConversionRate(symbol: string, currentPrice: number): Promise<number> {
  const pairInfo = currencyPairsInfo[symbol]

  if (!pairInfo) return 1 // Default to 1 if pair not found

  // If USD is the quote currency (e.g., EUR/USD), the rate is the current price
  if (pairInfo.usdIsQuote) return currentPrice

  // If USD is the base currency (e.g., USD/JPY), the rate is 1/price
  if (pairInfo.usdIsBase) return 1 / currentPrice

  // For cross pairs (e.g., EUR/GBP), we would need to get conversion rates
  // In a real app, you would fetch this from an API
  // For now, we'll return 1 as a placeholder
  return 1
}

// Calculate profit in account currency (USD)
export async function calculateProfit(
  symbol: string,
  direction: "Buy" | "Sell",
  entryPrice: number,
  exitPrice: number,
  lotSize: number,
  accountCurrency = "USD",
): Promise<{
  profit: number
  pips: number
  pipValue: number
  isWin: boolean
}> {
  // Get pip value and calculate pips
  const pipValue = getPipValue(symbol)
  let pips = calculatePips(symbol, entryPrice, exitPrice)

  // Adjust pips based on direction
  if (direction === "Sell") {
    pips = -pips
  }

  // Calculate units based on lot size
  const units = lotSize * STANDARD_LOT_SIZE

  // Calculate profit in the pair's quote currency
  let profit = pips * pipValue * units

  // Get the pair info
  const pairInfo = currencyPairsInfo[symbol]

  // Convert profit to account currency (USD)
  if (pairInfo) {
    // For USD/XXX pairs, we need to convert
    if (pairInfo.usdIsBase) {
      const conversionRate = await getConversionRate(symbol, exitPrice)
      profit = profit * conversionRate
    }

    // For XXX/YYY cross pairs (no USD), we would need additional conversion
    // This would require fetching exchange rates from an API
    if (!pairInfo.usdIsBase && !pairInfo.usdIsQuote) {
      // In a real app, you would convert to USD here
      // For now, we'll use a simplified approach
    }
  }

  // Round to 2 decimal places
  profit = Math.round(profit * 100) / 100

  return {
    profit,
    pips: Math.round(pips * 10) / 10, // Round pips to 1 decimal place
    pipValue: pipValue * STANDARD_LOT_SIZE, // Pip value per standard lot
    isWin: profit > 0,
  }
}

// Calculate risk-to-reward ratio
export function calculateRRR(stopLoss: number | null, takeProfit: number | null, entryPrice: number): number | null {
  if (!stopLoss || !takeProfit) return null

  const risk = Math.abs(entryPrice - stopLoss)
  const reward = Math.abs(takeProfit - entryPrice)

  if (risk === 0) return null

  return Math.round((reward / risk) * 10) / 10 // Round to 1 decimal place
}

// Calculate position size based on risk percentage
export function calculatePositionSize(
  symbol: string,
  accountBalance: number,
  riskPercentage: number,
  entryPrice: number,
  stopLoss: number,
): number {
  // Calculate risk amount in account currency
  const riskAmount = accountBalance * (riskPercentage / 100)

  // Calculate pip difference between entry and stop loss
  const pipDifference = Math.abs(calculatePips(symbol, entryPrice, stopLoss))

  // Get pip value
  const pipValue = getPipValue(symbol)

  // Calculate lot size
  const lotSize = riskAmount / (pipDifference * pipValue * STANDARD_LOT_SIZE)

  // Round to 2 decimal places
  return Math.round(lotSize * 100) / 100
}

// Format currency value
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(value)
}

// Format pips
export function formatPips(pips: number): string {
  const sign = pips > 0 ? "+" : ""
  return `${sign}${pips.toFixed(1)}`
}
