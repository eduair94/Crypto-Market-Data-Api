// Exchange Service Interface following Interface Segregation Principle
export interface IExchangeService {
  listExchanges(): Promise<string[]>;
  getExchangeInfo(exchangeId: string): Promise<any>;
  isExchangeSupported(exchangeId: string): boolean;
  createExchangeInstance(exchangeId: string, credentials?: any): Promise<any>;
}

// Market Data Interface
export interface IMarketDataService {
  getMarkets(exchangeId: string): Promise<any>;
  getTicker(exchangeId: string, symbol: string): Promise<any>;
  getOrderBook(exchangeId: string, symbol: string, limit?: number): Promise<any>;
  getTrades(exchangeId: string, symbol: string, limit?: number): Promise<any>;
  getOHLCV(
    exchangeId: string,
    symbol: string,
    timeframe: string,
    limit?: number,
  ): Promise<any>;
}

// Trading Interface
export interface ITradingService {
  getBalance(exchangeId: string): Promise<any>;
  createOrder(
    exchangeId: string,
    symbol: string,
    type: string,
    side: string,
    amount: number,
    price?: number,
    params?: any,
  ): Promise<any>;
  cancelOrder(exchangeId: string, orderId: string, symbol?: string): Promise<any>;
  getOrder(exchangeId: string, orderId: string, symbol?: string): Promise<any>;
  getOrders(exchangeId: string, symbol?: string, limit?: number): Promise<any>;
  getOpenOrders(exchangeId: string, symbol?: string): Promise<any>;
  getMyTrades(exchangeId: string, symbol?: string, limit?: number): Promise<any>;
}

// Portfolio Interface
export interface IPortfolioService {
  getPortfolio(exchangeId: string): Promise<any>;
  getPositions(exchangeId: string): Promise<any>;
  getTradingHistory(exchangeId: string, symbol?: string): Promise<any>;
  getProfitLoss(exchangeId: string, symbol?: string): Promise<any>;
}