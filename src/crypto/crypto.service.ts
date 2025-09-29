import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as ccxt from 'ccxt';

const exchanges:string[] = (ccxt.exchanges as any as string[]);

@Injectable()
export class CryptoService {
  private exchanges = new Map<string, ccxt.Exchange>();
  private redisClient: any = null;
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    if (process.env.REDIS_URL) {
      try {
        const { createClient } = await import('redis');
        this.redisClient = createClient({
          url: process.env.REDIS_URL,
        });
        
        this.redisClient.on('error', (err) => {
          console.log('Redis Client Error - falling back to in-memory cache:', err.message);
          this.redisClient = null;
        });
        
        await this.redisClient.connect();
        console.log('Redis connected successfully');
      } catch (error) {
        console.log('Redis connection failed - using in-memory cache:', error.message);
        this.redisClient = null;
      }
    }
  }

  private async getFromCache(key: string): Promise<any> {
    if (this.redisClient) {
      try {
        const result = await this.redisClient.get(key);
        return result ? JSON.parse(result) : null;
      } catch (error) {
        console.log('Redis get error:', error.message);
      }
    }
    
    // Fallback to memory cache
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private async setInCache(key: string, data: any, ttlSeconds: number = 30): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
        return;
      } catch (error) {
        console.log('Redis set error:', error.message);
      }
    }
    
    // Fallback to memory cache
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  // Get list of all available exchanges with basic info
  async getAvailableExchanges(): Promise<any[]> {
    const cacheKey = 'available_exchanges';
    
    // Try to get from cache first
    const cachedResult = await this.getFromCache(cacheKey);
    if (cachedResult) {
      console.log('Cache hit for available exchanges');
      return cachedResult;
    }

    const result = exchanges.map(exchangeId => {
      try {
        const ExchangeClass = ccxt[exchangeId];
        const exchangeInstance = new ExchangeClass();
        
        return {
          id: exchangeId,
          name: exchangeInstance.name || exchangeId,
          countries: exchangeInstance.countries || [],
          urls: {
            www: exchangeInstance.urls?.www || null,
            doc: exchangeInstance.urls?.doc || null,
            api: exchangeInstance.urls?.api || null,
          },
          has: {
            fetchTicker: exchangeInstance.has?.fetchTicker || false,
            fetchTickers: exchangeInstance.has?.fetchTickers || false,
            fetchOrderBook: exchangeInstance.has?.fetchOrderBook || false,
            fetchTrades: exchangeInstance.has?.fetchTrades || false,
            fetchOHLCV: exchangeInstance.has?.fetchOHLCV || false,
            createOrder: exchangeInstance.has?.createOrder || false,
            cancelOrder: exchangeInstance.has?.cancelOrder || false,
            fetchBalance: exchangeInstance.has?.fetchBalance || false,
          },
          rateLimit: exchangeInstance.rateLimit || 1000,
          certified: exchangeInstance.certified || false,
          pro: exchangeInstance.pro || false,
        };
      } catch (error) {
        return {
          id: exchangeId,
          name: exchangeId,
          error: 'Failed to initialize exchange info',
          countries: [],
          urls: {},
          has: {},
          rateLimit: 1000,
          certified: false,
          pro: false,
        };
      }
    }).sort((a, b) => a.name.localeCompare(b.name));

    // Cache the result for 60 seconds (exchanges don't change often)
    await this.setInCache(cacheKey, result, 60);
    console.log('Cached available exchanges');

    return result;
  }

  // Get simple list of exchange names
  getExchangeNames(): string[] {
    return exchanges.sort();
  }

  // Get detailed information about a specific exchange
  getExchangeDetails(exchangeId: string): any {
    if (!exchanges.includes(exchangeId)) {
      throw new BadRequestException(`Exchange '${exchangeId}' is not supported`);
    }

    try {
      const ExchangeClass = ccxt[exchangeId];
      const exchangeInstance = new ExchangeClass();
      
      return {
        id: exchangeId,
        name: exchangeInstance.name || exchangeId,
        countries: exchangeInstance.countries || [],
        urls: exchangeInstance.urls || {},
        version: exchangeInstance.version || null,
        rateLimit: exchangeInstance.rateLimit || 1000,
        timeout: exchangeInstance.timeout || 10000,
        certified: exchangeInstance.certified || false,
        pro: exchangeInstance.pro || false,
        has: exchangeInstance.has || {},
        timeframes: exchangeInstance.timeframes || {},
        fees: exchangeInstance.fees || {},
        limits: exchangeInstance.limits || {},
        precisionMode: exchangeInstance.precisionMode || null,
        requiredCredentials: exchangeInstance.requiredCredentials || {},
        description: this.getExchangeDescription(exchangeId),
        founded: this.getExchangeFounded(exchangeId),
        status: 'operational', // This could be enhanced to check actual status
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get details for exchange '${exchangeId}': ${error.message}`);
    }
  }

  private getExchangeDescription(exchangeId: string): string {
    const descriptions = {
      binance: 'World\'s largest cryptocurrency exchange by trading volume',
      coinbase: 'Leading US-based cryptocurrency exchange with regulatory compliance',
      kraken: 'Long-established US-based exchange known for security and reliability',
      bybit: 'Singapore-based derivatives and spot trading platform',
      okx: 'Global cryptocurrency exchange offering spot and derivatives trading',
      kucoin: 'Global cryptocurrency exchange with a wide variety of altcoins',
      huobi: 'Singapore-based global cryptocurrency exchange',
      gateio: 'Comprehensive cryptocurrency exchange with extensive altcoin selection',
      bitfinex: 'Advanced trading platform popular with professional traders',
      mexc: 'Global cryptocurrency exchange with focus on emerging tokens',
    };
    return descriptions[exchangeId] || `${exchangeId} cryptocurrency exchange`;
  }

  private getExchangeFounded(exchangeId: string): number | null {
    const foundedYears = {
      binance: 2017,
      coinbase: 2012,
      kraken: 2011,
      bybit: 2018,
      okx: 2017,
      kucoin: 2017,
      huobi: 2013,
      gateio: 2013,
      bitfinex: 2012,
      mexc: 2018,
    };
    return foundedYears[exchangeId] || null;
  }

  // Get exchange instance (cached)
  private async getExchange(exchangeId: string): Promise<ccxt.Exchange> {
    if (!exchanges.includes(exchangeId)) {
      throw new BadRequestException(`Exchange '${exchangeId}' is not supported`);
    }

    if (this.exchanges.has(exchangeId)) {
      return this.exchanges.get(exchangeId);
    }

    try {
      const ExchangeClass = ccxt[exchangeId];
      const exchange = new ExchangeClass({
        enableRateLimit: true,
      });

      await exchange.loadMarkets();
      this.exchanges.set(exchangeId, exchange);
      return exchange;
    } catch (error) {
      throw new BadRequestException(`Failed to initialize exchange '${exchangeId}': ${error.message}`);
    }
  }

  // Get ticker for a specific symbol
  async getTicker(exchangeId: string, symbol: string) {
    const exchange = await this.getExchange(exchangeId);
    
    if (!exchange.has.fetchTicker) {
      throw new BadRequestException(`Exchange '${exchangeId}' doesn't support ticker data`);
    }

    try {
      const ticker = await exchange.fetchTicker(symbol);
      return {
        exchange: exchangeId,
        symbol: ticker.symbol,
        timestamp: ticker.timestamp,
        datetime: ticker.datetime,
        last: ticker.last,
        bid: ticker.bid,
        ask: ticker.ask,
        high: ticker.high,
        low: ticker.low,
        open: ticker.open,
        close: ticker.close,
        change: ticker.change,
        percentage: ticker.percentage,
        volume: ticker.baseVolume,
        quoteVolume: ticker.quoteVolume,
      };
    } catch (error) {
      throw new NotFoundException(`Symbol '${symbol}' not found on ${exchangeId}: ${error.message}`);
    }
  }

  // Get order book for a symbol
  async getOrderBook(exchangeId: string, symbol: string, limit?: number) {
    const exchange = await this.getExchange(exchangeId);
    
    try {
      const orderbook = await exchange.fetchOrderBook(symbol, limit);
      return {
        exchange: exchangeId,
        symbol: orderbook.symbol,
        timestamp: orderbook.timestamp,
        bids: orderbook.bids.slice(0, limit || 20),
        asks: orderbook.asks.slice(0, limit || 20),
      };
    } catch (error) {
      throw new NotFoundException(`Symbol '${symbol}' not found on ${exchangeId}: ${error.message}`);
    }
  }

  // Get recent trades for a symbol
  async getTrades(exchangeId: string, symbol: string, limit?: number) {
    const exchange = await this.getExchange(exchangeId);
    
    try {
      const trades = await exchange.fetchTrades(symbol, undefined, limit || 50);
      return {
        exchange: exchangeId,
        symbol,
        trades: trades.map(trade => ({
          timestamp: trade.timestamp,
          price: trade.price,
          amount: trade.amount,
          side: trade.side,
        })),
      };
    } catch (error) {
      throw new NotFoundException(`Symbol '${symbol}' not found on ${exchangeId}: ${error.message}`);
    }
  }

  // Get markets for an exchange
  async getMarkets(exchangeId: string) {
    const exchange = await this.getExchange(exchangeId);
    
    return Object.keys(exchange.markets).map(symbol => {
      const market = exchange.markets[symbol];
      return {
        symbol,
        base: market.base,
        quote: market.quote,
        active: market.active,
      };
    });
  }

  // Get top cryptocurrencies USD rates for a specific exchange
  async getTopCryptoUSDRates(exchangeId: string, limit: number = 10) {
    const cacheKey = `usd_rates_${exchangeId}_${limit}`;
    
    // Try to get from cache first
    const cachedResult = await this.getFromCache(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedResult;
    }

    const exchange = await this.getExchange(exchangeId);
    
    if (!exchange.has.fetchTickers) {
      throw new BadRequestException(`Exchange '${exchangeId}' doesn't support fetching multiple tickers`);
    }

    try {
      // Define top cryptocurrencies by market cap (common ones)
      const topCryptos = [
        'BTC/USDT', 'BTC/USD', 'BTC/BUSD',
        'ETH/USDT', 'ETH/USD', 'ETH/BUSD', 
        'ADA/USDT', 'ADA/USD',
        'SOL/USDT', 'SOL/USD',
        'XRP/USDT', 'XRP/USD',
        'DOT/USDT', 'DOT/USD',
        'DOGE/USDT', 'DOGE/USD',
        'AVAX/USDT', 'AVAX/USD',
        'MATIC/USDT', 'MATIC/USD',
        'LTC/USDT', 'LTC/USD',
        'LINK/USDT', 'LINK/USD',
        'UNI/USDT', 'UNI/USD',
        'ATOM/USDT', 'ATOM/USD',
        'FTT/USDT', 'FTT/USD',
        'NEAR/USDT', 'NEAR/USD'
      ];

      // Get available markets from exchange
      const availableMarkets = Object.keys(exchange.markets);
      
      // Filter to only USD pairs available on this exchange
      const usdPairs = topCryptos.filter(symbol => availableMarkets.includes(symbol));
      
      // If no direct USD pairs, try to get USDT pairs as backup
      if (usdPairs.length === 0) {
        const usdtPairs = availableMarkets.filter(symbol => 
          symbol.endsWith('/USDT') && 
          topCryptos.some(crypto => crypto.split('/')[0] === symbol.split('/')[0])
        );
        usdPairs.push(...usdtPairs.slice(0, limit));
      }

      // Fetch tickers for available pairs
      const tickers = await exchange.fetchTickers(usdPairs.slice(0, limit));
      
      const results = [];
      const processedBases = new Set();

      for (const symbol of usdPairs.slice(0, limit)) {
        if (tickers[symbol]) {
          const ticker = tickers[symbol];
          console.log("Ticket", ticker);
          const base = (ticker as any).base || symbol.split('/')[0];
          
          // Avoid duplicates (prefer USD over USDT)
          if (!processedBases.has(base)) {
            results.push({
              cryptocurrency: base,
              symbol: ticker.symbol,
              price_usd: ticker.last,
              bid: ticker.bid,
              ask: ticker.ask,
              change_24h: ticker.change,
              percentage_change_24h: ticker.percentage,
              volume_24h: ticker.baseVolume,
              volume_usd_24h: ticker.quoteVolume,
              high_24h: ticker.high,
              low_24h: ticker.low,
              timestamp: ticker.timestamp,
              datetime: ticker.datetime,
            });
            processedBases.add(base);
          }
        }
      }

      // Sort by volume (descending) to get most traded pairs
      results.sort((a, b) => (b.volume_usd_24h || 0) - (a.volume_usd_24h || 0));

      const result = {
        exchange: exchangeId,
        timestamp: Date.now(),
        total_pairs: results.length,
        rates: results.slice(0, limit)
      };

      // Cache the result for 30 seconds
      await this.setInCache(cacheKey, result, 30);
      console.log(`Cached result for ${cacheKey}`);

      return result;

    } catch (error) {
      throw new BadRequestException(`Failed to fetch USD rates from ${exchangeId}: ${error.message}`);
    }
  }
}
