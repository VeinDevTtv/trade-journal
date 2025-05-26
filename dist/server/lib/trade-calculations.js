"use strict";
/**
 * Utility functions for trade calculations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyPairsInfo = void 0;
exports.getPipValue = getPipValue;
exports.calculatePips = calculatePips;
exports.getConversionRate = getConversionRate;
exports.calculateProfit = calculateProfit;
exports.calculateRRR = calculateRRR;
exports.calculatePositionSize = calculatePositionSize;
exports.formatCurrency = formatCurrency;
exports.formatPips = formatPips;
// Standard lot size in units
const STANDARD_LOT_SIZE = 100000;
const MINI_LOT_SIZE = 10000;
const MICRO_LOT_SIZE = 1000;
// Map of currency pairs with their properties
exports.currencyPairsInfo = {
    EURUSD: { symbol: "EURUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false },
    GBPUSD: { symbol: "GBPUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false },
    AUDUSD: { symbol: "AUDUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false },
    NZDUSD: { symbol: "NZDUSD", pipDecimalPlace: 4, usdIsQuote: true, usdIsBase: false },
    USDJPY: { symbol: "USDJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: true },
    USDCAD: { symbol: "USDCAD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
    USDCHF: { symbol: "USDCHF", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: true },
    EURJPY: { symbol: "EURJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: false },
    GBPJPY: { symbol: "GBPJPY", pipDecimalPlace: 2, usdIsQuote: false, usdIsBase: false },
    EURGBP: { symbol: "EURGBP", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
    AUDCAD: { symbol: "AUDCAD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
    AUDNZD: { symbol: "AUDNZD", pipDecimalPlace: 4, usdIsQuote: false, usdIsBase: false },
};
// Get pip value for a currency pair
function getPipValue(symbol) {
    const pairInfo = exports.currencyPairsInfo[symbol];
    if (!pairInfo)
        return 0.0001; // Default to 4 decimal places if pair not found
    return Math.pow(10, -pairInfo.pipDecimalPlace);
}
// Calculate number of pips between two prices
function calculatePips(symbol, entryPrice, exitPrice) {
    const pipValue = getPipValue(symbol);
    const pairInfo = exports.currencyPairsInfo[symbol];
    if (!pairInfo) {
        // Default calculation if pair not found
        return (exitPrice - entryPrice) / pipValue;
    }
    // For JPY pairs (2 decimal places), multiply by 100 to get standard pips
    if (pairInfo.pipDecimalPlace === 2) {
        return (exitPrice - entryPrice) / pipValue;
    }
    return (exitPrice - entryPrice) / pipValue;
}
// Get the conversion rate to USD for calculating profit in USD
async function getConversionRate(symbol, currentPrice) {
    const pairInfo = exports.currencyPairsInfo[symbol];
    if (!pairInfo)
        return 1; // Default to 1 if pair not found
    // If USD is the quote currency (e.g., EUR/USD), the rate is the current price
    if (pairInfo.usdIsQuote)
        return currentPrice;
    // If USD is the base currency (e.g., USD/JPY), the rate is 1/price
    if (pairInfo.usdIsBase)
        return 1 / currentPrice;
    // For cross pairs (e.g., EUR/GBP), we would need to get conversion rates
    // In a real app, you would fetch this from an API
    // For now, we'll return 1 as a placeholder
    return 1;
}
// Calculate profit in account currency (USD)
async function calculateProfit(symbol, direction, entryPrice, exitPrice, lotSize, accountCurrency = "USD") {
    // Get pip value and calculate pips
    const pipValue = getPipValue(symbol);
    let pips = calculatePips(symbol, entryPrice, exitPrice);
    // Adjust pips based on direction
    if (direction === "Sell") {
        pips = -pips;
    }
    // Calculate units based on lot size
    const units = lotSize * STANDARD_LOT_SIZE;
    // Calculate profit in the pair's quote currency
    let profit = pips * pipValue * units;
    // Get the pair info
    const pairInfo = exports.currencyPairsInfo[symbol];
    // Convert profit to account currency (USD)
    if (pairInfo) {
        // For USD/XXX pairs, we need to convert
        if (pairInfo.usdIsBase) {
            const conversionRate = await getConversionRate(symbol, exitPrice);
            profit = profit * conversionRate;
        }
        // For XXX/YYY cross pairs (no USD), we would need additional conversion
        // This would require fetching exchange rates from an API
        if (!pairInfo.usdIsBase && !pairInfo.usdIsQuote) {
            // In a real app, you would convert to USD here
            // For now, we'll use a simplified approach
        }
    }
    // Round to 2 decimal places
    profit = Math.round(profit * 100) / 100;
    return {
        profit,
        pips: Math.round(pips * 10) / 10, // Round pips to 1 decimal place
        pipValue: pipValue * STANDARD_LOT_SIZE, // Pip value per standard lot
        isWin: profit > 0,
    };
}
// Calculate risk-to-reward ratio
function calculateRRR(stopLoss, takeProfit, entryPrice) {
    if (!stopLoss || !takeProfit)
        return null;
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    if (risk === 0)
        return null;
    return Math.round((reward / risk) * 10) / 10; // Round to 1 decimal place
}
// Calculate position size based on risk percentage
function calculatePositionSize(symbol, accountBalance, riskPercentage, entryPrice, stopLoss) {
    // Calculate risk amount in account currency
    const riskAmount = accountBalance * (riskPercentage / 100);
    // Calculate pip difference between entry and stop loss
    const pipDifference = Math.abs(calculatePips(symbol, entryPrice, stopLoss));
    // Get pip value
    const pipValue = getPipValue(symbol);
    // Calculate lot size
    const lotSize = riskAmount / (pipDifference * pipValue * STANDARD_LOT_SIZE);
    // Round to 2 decimal places
    return Math.round(lotSize * 100) / 100;
}
// Format currency value
function formatCurrency(value, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(value);
}
// Format pips
function formatPips(pips) {
    const sign = pips > 0 ? "+" : "";
    return `${sign}${pips.toFixed(1)}`;
}
//# sourceMappingURL=trade-calculations.js.map