import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ccxt from 'ccxt';
import { ExchangeConfig } from '../../config/exchanges.config';
import { IExchangeService } from './interfaces/exchange.interface';

@Injectable()
export class ExchangeService implements IExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private readonly exchangeInstances = new Map<string, ccxt.Exchange>();

  constructor(private readonly configService: ConfigService) {}

  async listExchanges(): Promise<string[]> {
    try {
      return Object.keys(ccxt.exchanges).sort();
    } catch (error) {
      this.logger.error('Error listing exchanges', error);
      throw new BadRequestException('Failed to list exchanges');
    }
  }

  async getExchangeInfo(exchangeId: string): Promise<any> {
    try {
      if (!this.isExchangeSupported(exchangeId)) {
        throw new BadRequestException(`Exchange ${exchangeId} is not supported`);
      }

      const exchangeClass = ccxt[exchangeId];
      const tempInstance = new exchangeClass();
      
      return {
        id: tempInstance.id,
        name: tempInstance.name,
        countries: tempInstance.countries,
        rateLimit: tempInstance.rateLimit,
        certified: tempInstance.certified || false,
        pro: tempInstance.pro || false,
        has: tempInstance.has,
        urls: tempInstance.urls,
        fees: tempInstance.fees,
        timeframes: tempInstance.timeframes,
        markets: Object.keys(tempInstance.markets || {}),
      };
    } catch (error) {
      this.logger.error(`Error getting exchange info for ${exchangeId}`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get exchange info for ${exchangeId}`);
    }
  }

  isExchangeSupported(exchangeId: string): boolean {
    return Object.keys(ccxt.exchanges).includes(exchangeId);
  }

  async createExchangeInstance(
    exchangeId: string,
    credentials?: any,
  ): Promise<ccxt.Exchange> {
    try {
      if (!this.isExchangeSupported(exchangeId)) {
        throw new BadRequestException(`Exchange ${exchangeId} is not supported`);
      }

      const cacheKey = `${exchangeId}-${JSON.stringify(credentials || {})}`;
      
      if (this.exchangeInstances.has(cacheKey)) {
        return this.exchangeInstances.get(cacheKey);
      }

      const exchangeConfig = this.configService.get<ExchangeConfig>(
        `exchanges.${exchangeId}`,
        {},
      );

      const config = {
        ...exchangeConfig,
        ...credentials,
        enableRateLimit: true,
      };

      const exchangeClass = ccxt[exchangeId];
      const instance = new exchangeClass(config);

      // Load markets for the exchange
      await instance.loadMarkets();

      this.exchangeInstances.set(cacheKey, instance);
      this.logger.log(`Created exchange instance for ${exchangeId}`);

      return instance;
    } catch (error) {
      this.logger.error(`Error creating exchange instance for ${exchangeId}`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create exchange instance for ${exchangeId}`);
    }
  }

  async getExchangeInstance(exchangeId: string): Promise<ccxt.Exchange> {
    return this.createExchangeInstance(exchangeId);
  }

  private clearInstanceCache(): void {
    this.exchangeInstances.clear();
  }
}