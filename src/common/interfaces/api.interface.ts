export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExchangeInfo {
  id: string;
  name: string;
  countries: string[];
  rateLimit: number;
  certified: boolean;
  pro: boolean;
  has: {
    [key: string]: boolean | string;
  };
  urls: {
    logo: string;
    api: string | object;
    www: string;
    doc: string | string[];
  };
  fees: {
    trading: {
      maker: number;
      taker: number;
    };
  };
}

export interface MarketData {
  symbol: string;
  base: string;
  quote: string;
  active: boolean;
  type: string;
  spot: boolean;
  margin: boolean;
  future: boolean;
  option: boolean;
  contract: boolean;
  settle: string;
  settleId: string;
  contractSize: number;
  linear: boolean;
  inverse: boolean;
  expiry: number;
  expiryDatetime: string;
  strike: number;
  optionType: string;
  precision: {
    amount: number;
    price: number;
  };
  limits: {
    amount: {
      min: number;
      max: number;
    };
    price: {
      min: number;
      max: number;
    };
    cost: {
      min: number;
      max: number;
    };
  };
  info: any;
}

export interface TickerData {
  symbol: string;
  timestamp: number;
  datetime: string;
  high: number;
  low: number;
  bid: number;
  bidVolume: number;
  ask: number;
  askVolume: number;
  vwap: number;
  open: number;
  close: number;
  last: number;
  previousClose: number;
  change: number;
  percentage: number;
  average: number;
  baseVolume: number;
  quoteVolume: number;
  info: any;
}

export interface OrderBookData {
  symbol: string;
  timestamp: number;
  datetime: string;
  nonce: number;
  bids: [number, number][];
  asks: [number, number][];
  info: any;
}

export interface TradeData {
  id: string;
  timestamp: number;
  datetime: string;
  symbol: string;
  order: string;
  type: string;
  side: string;
  amount: number;
  price: number;
  cost: number;
  fee: {
    cost: number;
    currency: string;
  };
  info: any;
}

export interface BalanceData {
  [currency: string]: {
    free: number;
    used: number;
    total: number;
  };
}

export interface OrderData {
  id: string;
  clientOrderId: string;
  timestamp: number;
  datetime: string;
  lastTradeTimestamp: number;
  status: string;
  symbol: string;
  type: string;
  timeInForce: string;
  side: string;
  amount: number;
  price: number;
  cost: number;
  average: number;
  filled: number;
  remaining: number;
  fee: {
    cost: number;
    currency: string;
  };
  trades: TradeData[];
  info: any;
}

export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}