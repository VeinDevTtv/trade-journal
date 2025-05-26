/**
 * Utility functions for trade calculations
 */
export interface CurrencyPairInfo {
    symbol: string;
    pipDecimalPlace: number;
    usdIsQuote: boolean;
    usdIsBase: boolean;
}
export declare const currencyPairsInfo: Record<string, CurrencyPairInfo>;
export declare function getPipValue(symbol: string): number;
export declare function calculatePips(symbol: string, entryPrice: number, exitPrice: number): number;
export declare function getConversionRate(symbol: string, currentPrice: number): Promise<number>;
export declare function calculateProfit(symbol: string, direction: "Buy" | "Sell", entryPrice: number, exitPrice: number, lotSize: number, accountCurrency?: string): Promise<{
    profit: number;
    pips: number;
    pipValue: number;
    isWin: boolean;
}>;
export declare function calculateRRR(stopLoss: number | null, takeProfit: number | null, entryPrice: number): number | null;
export declare function calculatePositionSize(symbol: string, accountBalance: number, riskPercentage: number, entryPrice: number, stopLoss: number): number;
export declare function formatCurrency(value: number, currency?: string): string;
export declare function formatPips(pips: number): string;
//# sourceMappingURL=trade-calculations.d.ts.map