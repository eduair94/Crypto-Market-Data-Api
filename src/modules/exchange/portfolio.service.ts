import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { IPortfolioService } from './interfaces/exchange.interface';
import { MarketDataService } from './market-data.service';
import { TradingService } from './trading.service';

@Injectable()
export class PortfolioService implements IPortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private readonly tradingService: TradingService,
    private readonly marketDataService: MarketDataService,
  ) {}

  async getPortfolio(exchangeId: string, credentials?: any): Promise<any> {
    try {
      const balance = await this.tradingService.getBalance(exchangeId, credentials);
      
      const portfolio = {
        exchange: exchangeId,
        timestamp: new Date().toISOString(),
        total: balance.total,
        free: balance.free,
        used: balance.used,
        currencies: [],
        totalValueUSD: 0,
      };

      // Calculate portfolio value in USD
      for (const [currency, amounts] of Object.entries(balance.total)) {
        if (amounts && (amounts as any) > 0) {
          let valueUSD = 0;
          
          try {
            if (currency !== 'USD' && currency !== 'USDT' && currency !== 'USDC') {
              const symbol = `${currency}/USDT`;
              const ticker = await this.marketDataService.getTicker(exchangeId, symbol);
              valueUSD = (amounts as any) * ticker.last;
            } else {
              valueUSD = amounts as any;
            }
          } catch (error) {
            this.logger.warn(`Could not get price for ${currency}, using 0 value`);
          }

          portfolio.currencies.push({
            currency,
            total: amounts,
            free: balance.free[currency] || 0,
            used: balance.used[currency] || 0,
            valueUSD,
          });

          portfolio.totalValueUSD += valueUSD;
        }
      }

      return portfolio;
    } catch (error) {
      this.logger.error(`Error getting portfolio for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get portfolio for ${exchangeId}`);
    }
  }

  async getPositions(exchangeId: string, credentials?: any): Promise<any> {
    try {
      // Note: Not all exchanges support positions, this is mainly for futures/margin trading
      const balance = await this.tradingService.getBalance(exchangeId, credentials);
      
      // For spot trading, positions are essentially the balances
      const positions = [];
      
      for (const [currency, amounts] of Object.entries(balance.total)) {
        if (amounts && (amounts as any) > 0) {
          positions.push({
            symbol: currency,
            side: 'long', // Spot positions are always long
            size: amounts,
            contracts: amounts,
            contractSize: 1,
            unrealizedPnl: 0, // Spot doesn't have unrealized PnL in the traditional sense
            percentage: 0,
            timestamp: new Date().toISOString(),
          });
        }
      }

      return {
        exchange: exchangeId,
        positions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error getting positions for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get positions for ${exchangeId}`);
    }
  }

  async getTradingHistory(
    exchangeId: string,
    symbol?: string,
    credentials?: any,
  ): Promise<any> {
    try {
      const trades = await this.tradingService.getMyTrades(exchangeId, symbol, 100, credentials);
      
      const summary = {
        exchange: exchangeId,
        symbol: symbol || 'ALL',
        totalTrades: trades.length,
        totalVolume: 0,
        totalFees: 0,
        averageTradeSize: 0,
        profitableTrades: 0,
        unprofitableTrades: 0,
        trades: trades.map((trade: any) => ({
          id: trade.id,
          timestamp: trade.timestamp,
          datetime: trade.datetime,
          symbol: trade.symbol,
          side: trade.side,
          amount: trade.amount,
          price: trade.price,
          cost: trade.cost,
          fee: trade.fee,
        })),
      };

      // Calculate summary statistics
      for (const trade of trades) {
        summary.totalVolume += trade.cost || 0;
        summary.totalFees += trade.fee?.cost || 0;
      }

      summary.averageTradeSize = summary.totalTrades > 0 ? 
        summary.totalVolume / summary.totalTrades : 0;

      return summary;
    } catch (error) {
      this.logger.error(`Error getting trading history for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get trading history for ${exchangeId}`);
    }
  }

  async getProfitLoss(
    exchangeId: string,
    symbol?: string,
    credentials?: any,
  ): Promise<any> {
    try {
      const trades = await this.tradingService.getMyTrades(exchangeId, symbol, 100, credentials);
      
      const pnlData = {
        exchange: exchangeId,
        symbol: symbol || 'ALL',
        totalPnL: 0,
        realizedPnL: 0,
        unrealizedPnL: 0, // For spot trading, this would be based on current market prices
        totalFees: 0,
        netPnL: 0,
        trades: trades.length,
        winners: 0,
        losers: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        profitFactor: 0,
      };

      // Calculate basic P&L metrics
      let totalWins = 0;
      let totalLosses = 0;
      let winAmount = 0;
      let lossAmount = 0;

      for (const trade of trades) {
        const fee = trade.fee?.cost || 0;
        pnlData.totalFees += fee;
        
        // For a simple P&L calculation, we need to track buy/sell pairs
        // This is a simplified approach - real P&L calculation would be more complex
        if (trade.side === 'sell') {
          // Simplified: assume profit/loss based on trade cost vs average buy price
          // In reality, you'd need to track FIFO/LIFO accounting
          pnlData.realizedPnL += trade.cost - fee;
        } else {
          pnlData.realizedPnL -= trade.cost + fee;
        }
      }

      pnlData.netPnL = pnlData.realizedPnL - pnlData.totalFees;
      pnlData.winRate = pnlData.trades > 0 ? (pnlData.winners / pnlData.trades) * 100 : 0;

      return pnlData;
    } catch (error) {
      this.logger.error(`Error calculating P&L for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to calculate P&L for ${exchangeId}`);
    }
  }
}