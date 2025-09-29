import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { IMarketDataService } from './interfaces/exchange.interface';

@Injectable()
export class MarketDataService implements IMarketDataService {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(private readonly exchangeService: ExchangeService) {}

  async getMarkets(exchangeId: string): Promise<any> {
    try {
      const exchange = await this.exchangeService.getExchangeInstance(exchangeId);
      return exchange.markets;
    } catch (error) {
      this.logger.error(`Error getting markets for ${exchangeId}`, error);
      throw new BadRequestException(`Failed to get markets for ${exchangeId}`);
    }
  }

  async getTicker(exchangeId: string, symbol: string): Promise<any> {
    try {
      const exchange = await this.exchangeService.getExchangeInstance(exchangeId);
      return await exchange.fetchTicker(symbol);
    } catch (error) {
      this.logger.error(`Error getting ticker for ${exchangeId}:${symbol}`, error);
      throw new BadRequestException(`Failed to get ticker for ${symbol} on ${exchangeId}`);
    }
  }

  async getOrderBook(exchangeId: string, symbol: string, limit?: number): Promise<any> {
    try {
      const exchange = await this.exchangeService.getExchangeInstance(exchangeId);
      return await exchange.fetchOrderBook(symbol, limit);
    } catch (error) {
      this.logger.error(`Error getting order book for ${exchangeId}:${symbol}`, error);
      throw new BadRequestException(`Failed to get order book for ${symbol} on ${exchangeId}`);
    }
  }

  async getTrades(exchangeId: string, symbol: string, limit?: number): Promise<any> {
    try {
      const exchange = await this.exchangeService.getExchangeInstance(exchangeId);
      return await exchange.fetchTrades(symbol, undefined, limit);
    } catch (error) {
      this.logger.error(`Error getting trades for ${exchangeId}:${symbol}`, error);
      throw new BadRequestException(`Failed to get trades for ${symbol} on ${exchangeId}`);
    }
  }

  async getOHLCV(
    exchangeId: string,
    symbol: string,
    timeframe: string,
    limit?: number,
  ): Promise<any> {
    try {
      const exchange = await this.exchangeService.getExchangeInstance(exchangeId);
      
      if (!exchange.has['fetchOHLCV']) {
        throw new BadRequestException(`Exchange ${exchangeId} does not support OHLCV data`);
      }

      return await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
    } catch (error) {
      this.logger.error(`Error getting OHLCV for ${exchangeId}:${symbol}`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get OHLCV for ${symbol} on ${exchangeId}`);
    }
  }

  async getAllTickers(exchangeId: string): Promise<any> {
    try {
      const exchange = await this.exchangeService.getExchangeInstance(exchangeId);
      
      if (!exchange.has['fetchTickers']) {
        throw new BadRequestException(`Exchange ${exchangeId} does not support fetching all tickers`);
      }

      return await exchange.fetchTickers();
    } catch (error) {
      this.logger.error(`Error getting all tickers for ${exchangeId}`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get all tickers for ${exchangeId}`);
    }
  }

  async getCurrencies(exchangeId: string): Promise<any> {
    try {
      const exchange = await this.exchangeService.getExchangeInstance(exchangeId);
      return exchange.currencies;
    } catch (error) {
      this.logger.error(`Error getting currencies for ${exchangeId}`, error);
      throw new BadRequestException(`Failed to get currencies for ${exchangeId}`);
    }
  }
}