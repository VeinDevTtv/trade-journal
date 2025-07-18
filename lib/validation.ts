import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number')

// Trade validation schemas
export const tradeTypeSchema = z.enum(['BUY', 'SELL'], {
  errorMap: () => ({ message: 'Trade type must be either BUY or SELL' })
})

export const tradeStatusSchema = z.enum(['OPEN', 'CLOSED', 'PENDING'], {
  errorMap: () => ({ message: 'Invalid trade status' })
})

export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'], {
  errorMap: () => ({ message: 'Unsupported currency' })
})

export const tradingPairSchema = z.string()
  .min(6, 'Trading pair must be at least 6 characters')
  .max(10, 'Trading pair must be at most 10 characters')
  .regex(/^[A-Z]{3,4}[A-Z]{3,4}$|^[A-Z]+\d*$/, 'Invalid trading pair format')

export const createTradeSchema = z.object({
  symbol: tradingPairSchema,
  type: tradeTypeSchema,
  entry_price: z.number()
    .positive('Entry price must be positive')
    .max(1000000, 'Entry price is too high'),
  exit_price: z.number()
    .positive('Exit price must be positive')
    .max(1000000, 'Exit price is too high')
    .optional(),
  quantity: z.number()
    .positive('Quantity must be positive')
    .max(1000000, 'Quantity is too high'),
  stop_loss: z.number()
    .positive('Stop loss must be positive')
    .max(1000000, 'Stop loss is too high')
    .optional(),
  take_profit: z.number()
    .positive('Take profit must be positive')
    .max(1000000, 'Take profit is too high')
    .optional(),
  entry_time: z.string()
    .datetime('Invalid entry time format')
    .or(z.date()),
  exit_time: z.string()
    .datetime('Invalid exit time format')
    .or(z.date())
    .optional(),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  account_id: z.number()
    .int('Account ID must be an integer')
    .positive('Account ID must be positive'),
  commission: z.number()
    .min(0, 'Commission cannot be negative')
    .max(10000, 'Commission is too high')
    .optional(),
  swap: z.number()
    .max(10000, 'Swap is too high')
    .min(-10000, 'Swap is too low')
    .optional(),
}).refine((data) => {
  // Entry time should be before exit time if both are provided
  if (data.exit_time) {
    const entryTime = new Date(data.entry_time)
    const exitTime = new Date(data.exit_time)
    return entryTime <= exitTime
  }
  return true
}, {
  message: 'Entry time must be before exit time',
  path: ['exit_time']
}).refine((data) => {
  // Stop loss validation based on trade type
  if (data.stop_loss && data.type === 'BUY') {
    return data.stop_loss < data.entry_price
  }
  if (data.stop_loss && data.type === 'SELL') {
    return data.stop_loss > data.entry_price
  }
  return true
}, {
  message: 'Stop loss must be below entry price for BUY trades and above entry price for SELL trades',
  path: ['stop_loss']
}).refine((data) => {
  // Take profit validation based on trade type
  if (data.take_profit && data.type === 'BUY') {
    return data.take_profit > data.entry_price
  }
  if (data.take_profit && data.type === 'SELL') {
    return data.take_profit < data.entry_price
  }
  return true
}, {
  message: 'Take profit must be above entry price for BUY trades and below entry price for SELL trades',
  path: ['take_profit']
})

export const updateTradeSchema = z.object({
  id: z.number().int().positive(),
  symbol: tradingPairSchema.optional(),
  type: tradeTypeSchema.optional(),
  entry_price: z.number()
    .positive('Entry price must be positive')
    .max(1000000, 'Entry price is too high')
    .optional(),
  exit_price: z.number()
    .positive('Exit price must be positive')
    .max(1000000, 'Exit price is too high')
    .optional(),
  quantity: z.number()
    .positive('Quantity must be positive')
    .max(1000000, 'Quantity is too high')
    .optional(),
  stop_loss: z.number()
    .positive('Stop loss must be positive')
    .max(1000000, 'Stop loss is too high')
    .optional(),
  take_profit: z.number()
    .positive('Take profit must be positive')
    .max(1000000, 'Take profit is too high')
    .optional(),
  entry_time: z.string()
    .datetime('Invalid entry time format')
    .or(z.date())
    .optional(),
  exit_time: z.string()
    .datetime('Invalid exit time format')
    .or(z.date())
    .optional(),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  account_id: z.number()
    .int('Account ID must be an integer')
    .positive('Account ID must be positive')
    .optional(),
  commission: z.number()
    .min(0, 'Commission cannot be negative')
    .max(10000, 'Commission is too high')
    .optional(),
  swap: z.number()
    .max(10000, 'Swap is too high')
    .min(-10000, 'Swap is too low')
    .optional(),
})

// Account validation schemas
export const accountTypeSchema = z.enum(['FTMO', 'MyForexFunds', 'Demo', 'Live', 'Challenge', 'Verification'], {
  errorMap: () => ({ message: 'Invalid account type' })
})

export const createAccountSchema = z.object({
  name: z.string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters')
    .trim(),
  type: accountTypeSchema,
  balance: z.number()
    .positive('Balance must be positive')
    .max(10000000, 'Balance is too high'),
  currency: currencySchema,
  phase: z.string()
    .max(50, 'Phase must be less than 50 characters')
    .optional(),
})

export const updateAccountSchema = createAccountSchema.partial().extend({
  id: z.number().int().positive(),
  is_active: z.boolean().optional()
})

// User settings validation
export const userSettingsSchema = z.object({
  timezone: z.string()
    .min(1, 'Timezone is required')
    .max(50, 'Timezone must be less than 50 characters'),
  currency: currencySchema,
  date_format: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], {
    errorMap: () => ({ message: 'Invalid date format' })
  }),
  time_format: z.enum(['12h', '24h'], {
    errorMap: () => ({ message: 'Invalid time format' })
  }),
  theme: z.enum(['light', 'dark', 'system'], {
    errorMap: () => ({ message: 'Invalid theme' })
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    trade_alerts: z.boolean(),
    weekly_summary: z.boolean(),
  }),
  risk_management: z.object({
    max_daily_loss: z.number()
      .min(0, 'Max daily loss cannot be negative')
      .max(100, 'Max daily loss cannot exceed 100%'),
    max_risk_per_trade: z.number()
      .min(0, 'Max risk per trade cannot be negative')
      .max(100, 'Max risk per trade cannot exceed 100%'),
    max_open_trades: z.number()
      .int('Max open trades must be an integer')
      .min(1, 'Must allow at least 1 open trade')
      .max(100, 'Cannot exceed 100 open trades'),
  }),
})

// Query parameter validation
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
})

export const dateRangeSchema = z.object({
  date_from: z.string().datetime('Invalid start date format').optional(),
  date_to: z.string().datetime('Invalid end date format').optional(),
}).refine((data) => {
  if (data.date_from && data.date_to) {
    return new Date(data.date_from) <= new Date(data.date_to)
  }
  return true
}, {
  message: 'Start date must be before end date',
  path: ['date_to']
})

export const tradeFiltersSchema = z.object({
  symbol: z.string().optional(),
  type: tradeTypeSchema.optional(),
  is_win: z.boolean().optional(),
  account_id: z.number().int().positive().optional(),
  min_profit: z.number().optional(),
  max_profit: z.number().optional(),
  tags: z.array(z.string()).optional(),
  date_from: z.string().datetime('Invalid start date format').optional(),
  date_to: z.string().datetime('Invalid end date format').optional(),
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
}).refine((data) => {
  if (data.date_from && data.date_to) {
    return new Date(data.date_from) <= new Date(data.date_to)
  }
  return true
}, {
  message: 'Start date must be before end date',
  path: ['date_to']
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
}).refine((data) => {
  return data.file.size <= data.maxSize
}, {
  message: 'File size exceeds maximum allowed size',
  path: ['file']
}).refine((data) => {
  return data.allowedTypes.includes(data.file.type)
}, {
  message: 'File type not allowed',
  path: ['file']
})

// Export validation function helpers
export const validateTrade = (data: unknown) => createTradeSchema.parse(data)
export const validateTradeUpdate = (data: unknown) => updateTradeSchema.parse(data)
export const validateAccount = (data: unknown) => createAccountSchema.parse(data)
export const validateAccountUpdate = (data: unknown) => updateAccountSchema.parse(data)
export const validateUserSettings = (data: unknown) => userSettingsSchema.parse(data)
export const validateTradeFilters = (data: unknown) => tradeFiltersSchema.parse(data)
export const validateFileUpload = (data: unknown) => fileUploadSchema.parse(data)

// Safe validation functions that return results instead of throwing
export const safeValidateTrade = (data: unknown) => createTradeSchema.safeParse(data)
export const safeValidateTradeUpdate = (data: unknown) => updateTradeSchema.safeParse(data)
export const safeValidateAccount = (data: unknown) => createAccountSchema.safeParse(data)
export const safeValidateAccountUpdate = (data: unknown) => updateAccountSchema.safeParse(data)
export const safeValidateUserSettings = (data: unknown) => userSettingsSchema.safeParse(data)
export const safeValidateTradeFilters = (data: unknown) => tradeFiltersSchema.safeParse(data)
export const safeValidateFileUpload = (data: unknown) => fileUploadSchema.safeParse(data)

// Type exports
export type CreateTradeInput = z.infer<typeof createTradeSchema>
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>
export type CreateAccountInput = z.infer<typeof createAccountSchema>
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>
export type UserSettingsInput = z.infer<typeof userSettingsSchema>
export type TradeFiltersInput = z.infer<typeof tradeFiltersSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema> 