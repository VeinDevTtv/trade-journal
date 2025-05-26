export interface User {
  id: number;
  discord_id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'FTMO Challenge' | 'MyForexFunds' | 'Demo Account' | 'Live Account' | 'Other';
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Trade {
  id: number;
  user_id: number;
  account_id: number;
  symbol: string;
  direction: 'Buy' | 'Sell';
  entry_price: number;
  exit_price: number;
  stop_loss?: number;
  take_profit?: number;
  volume: number;
  profit: number;
  pips: number;
  pip_value: number;
  rrr?: number;
  is_win: boolean;
  trade_date: Date;
  trade_time: string;
  notes?: string;
  screenshot_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TradeTag {
  id: number;
  trade_id: number;
  tag: string;
  created_at: Date;
}

export interface UserSettings {
  id: number;
  user_id: number;
  default_lot_size: number;
  default_risk_percentage: number;
  default_account_id?: number;
  default_timeframe: string;
  auto_calculate_position_size: boolean;
  enforce_risk_limits: boolean;
  max_risk_per_trade?: number;
  max_daily_risk?: number;
  default_tags?: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

// File upload type
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// API Request/Response types
export interface CreateTradeRequest {
  symbol: string;
  direction: 'Buy' | 'Sell';
  entry_price: number;
  exit_price: number;
  stop_loss?: number;
  take_profit?: number;
  volume: number;
  account_id: number;
  trade_date: string;
  trade_time: string;
  notes?: string;
  tags?: string[];
  screenshot?: UploadedFile;
}

export interface UpdateTradeRequest extends Partial<CreateTradeRequest> {
  id: number;
}

export interface TradeResponse extends Trade {
  tags: string[];
  account_name: string;
}

export interface CreateAccountRequest {
  name: string;
  type: Account['type'];
  balance: number;
  currency: string;
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {
  id: number;
  is_active?: boolean;
}

export interface UpdateUserSettingsRequest extends Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {}

export interface AnalyticsData {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit: number;
  best_day: {
    date: string;
    profit: number;
    trades: number;
  };
  profit_by_symbol: Array<{
    symbol: string;
    profit: number;
    trades: number;
  }>;
  profit_by_day: Array<{
    day: string;
    profit: number;
    trades: number;
  }>;
  equity_curve: Array<{
    date: string;
    equity: number;
  }>;
  monthly_performance: Array<{
    month: string;
    profit: number;
    trades: number;
    win_rate: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database connection types
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Authentication types
export interface DiscordProfile {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
}

export interface JWTPayload {
  userId: number;
  discordId: string;
  username: string;
  iat: number;
  exp: number;
} 