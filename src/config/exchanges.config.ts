import { registerAs } from '@nestjs/config';

export interface ExchangeConfig {
  apiKey?: string;
  secret?: string;
  sandbox?: boolean;
  enableRateLimit?: boolean;
  timeout?: number;
}

export interface ExchangesConfig {
  [key: string]: ExchangeConfig;
}

export default registerAs('exchanges', (): ExchangesConfig => ({
  binance: {
    apiKey: process.env.BINANCE_API_KEY,
    secret: process.env.BINANCE_SECRET,
    sandbox: process.env.NODE_ENV !== 'production',
    enableRateLimit: true,
    timeout: 30000,
  },
  coinbase: {
    apiKey: process.env.COINBASE_API_KEY,
    secret: process.env.COINBASE_SECRET,
    sandbox: process.env.NODE_ENV !== 'production',
    enableRateLimit: true,
    timeout: 30000,
  },
  kraken: {
    apiKey: process.env.KRAKEN_API_KEY,
    secret: process.env.KRAKEN_SECRET,
    sandbox: process.env.NODE_ENV !== 'production',
    enableRateLimit: true,
    timeout: 30000,
  },
  kucoin: {
    apiKey: process.env.KUCOIN_API_KEY,
    secret: process.env.KUCOIN_SECRET,
    sandbox: process.env.NODE_ENV !== 'production',
    enableRateLimit: true,
    timeout: 30000,
  },
  huobi: {
    apiKey: process.env.HUOBI_API_KEY,
    secret: process.env.HUOBI_SECRET,
    sandbox: process.env.NODE_ENV !== 'production',
    enableRateLimit: true,
    timeout: 30000,
  },
}));