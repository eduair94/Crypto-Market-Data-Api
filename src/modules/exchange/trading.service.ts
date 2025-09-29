import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ITradingService } from './interfaces/exchange.interface';

@Injectable()
export class TradingService implements ITradingService {
  private readonly logger = new Logger(TradingService.name);

  constructor(private readonly exchangeService: ExchangeService) {}

  async getBalance(exchangeId: string, credentials?: any): Promise<any> {
    try {
      const exchange = await this.exchangeService.createExchangeInstance(
        exchangeId,
        credentials,
      );

      if (!exchange.apiKey || !exchange.secret) {
        throw new UnauthorizedException('API credentials are required for balance retrieval');
      }

      return await exchange.fetchBalance();
    } catch (error) {
      this.logger.error(`Error getting balance for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get balance for ${exchangeId}`);
    }
  }

  async createOrder(
    exchangeId: string,
    symbol: string,
    type: string,
    side: string,
    amount: number,
    price?: number,
    params?: any,
    credentials?: any,
  ): Promise<any> {
    try {
      const exchange = await this.exchangeService.createExchangeInstance(
        exchangeId,
        credentials,
      );

      if (!exchange.apiKey || !exchange.secret) {
        throw new UnauthorizedException('API credentials are required for trading');
      }

      return await exchange.createOrder(symbol, type, side, amount, price, params);
    } catch (error) {
      this.logger.error(`Error creating order for ${exchangeId}:${symbol}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create order for ${symbol} on ${exchangeId}`);
    }
  }

  async cancelOrder(
    exchangeId: string,
    orderId: string,
    symbol?: string,
    credentials?: any,
  ): Promise<any> {
    try {
      const exchange = await this.exchangeService.createExchangeInstance(
        exchangeId,
        credentials,
      );

      if (!exchange.apiKey || !exchange.secret) {
        throw new UnauthorizedException('API credentials are required for order cancellation');
      }

      return await exchange.cancelOrder(orderId, symbol);
    } catch (error) {
      this.logger.error(`Error cancelling order ${orderId} for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to cancel order ${orderId} on ${exchangeId}`);
    }
  }

  async getOrder(
    exchangeId: string,
    orderId: string,
    symbol?: string,
    credentials?: any,
  ): Promise<any> {
    try {
      const exchange = await this.exchangeService.createExchangeInstance(
        exchangeId,
        credentials,
      );

      if (!exchange.apiKey || !exchange.secret) {
        throw new UnauthorizedException('API credentials are required for order retrieval');
      }

      return await exchange.fetchOrder(orderId, symbol);
    } catch (error) {
      this.logger.error(`Error getting order ${orderId} for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get order ${orderId} from ${exchangeId}`);
    }
  }

  async getOrders(
    exchangeId: string,
    symbol?: string,
    limit?: number,
    credentials?: any,
  ): Promise<any> {
    try {
      const exchange = await this.exchangeService.createExchangeInstance(
        exchangeId,
        credentials,
      );

      if (!exchange.apiKey || !exchange.secret) {
        throw new UnauthorizedException('API credentials are required for order history');
      }

      return await exchange.fetchOrders(symbol, undefined, limit);
    } catch (error) {
      this.logger.error(`Error getting orders for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get orders from ${exchangeId}`);
    }
  }

  async getOpenOrders(
    exchangeId: string,
    symbol?: string,
    credentials?: any,
  ): Promise<any> {
    try {
      const exchange = await this.exchangeService.createExchangeInstance(
        exchangeId,
        credentials,
      );

      if (!exchange.apiKey || !exchange.secret) {
        throw new UnauthorizedException('API credentials are required for open orders');
      }

      return await exchange.fetchOpenOrders(symbol);
    } catch (error) {
      this.logger.error(`Error getting open orders for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get open orders from ${exchangeId}`);
    }
  }

  async getMyTrades(
    exchangeId: string,
    symbol?: string,
    limit?: number,
    credentials?: any,
  ): Promise<any> {
    try {
      const exchange = await this.exchangeService.createExchangeInstance(
        exchangeId,
        credentials,
      );

      if (!exchange.apiKey || !exchange.secret) {
        throw new UnauthorizedException('API credentials are required for trade history');
      }

      return await exchange.fetchMyTrades(symbol, undefined, limit);
    } catch (error) {
      this.logger.error(`Error getting trades for ${exchangeId}`, error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get trades from ${exchangeId}`);
    }
  }

  async getOrderStatus(
    exchangeId: string,
    orderId: string,
    symbol?: string,
    credentials?: any,
  ): Promise<string> {
    try {
      const order = await this.getOrder(exchangeId, orderId, symbol, credentials);
      return order.status;
    } catch (error) {
      this.logger.error(`Error getting order status for ${orderId} on ${exchangeId}`, error);
      throw error;
    }
  }
}