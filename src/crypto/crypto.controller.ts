import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';

@ApiTags('exchanges')
@Controller('exchanges')
@UseInterceptors(CacheInterceptor)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get()
  @ApiOperation({ summary: 'Get detailed list of available exchanges with capabilities and information' })
  async getExchanges() {
    const exchanges = await this.cryptoService.getAvailableExchanges();
    return {
      exchanges,
      count: exchanges.length,
      summary: {
        total: exchanges.length,
        certified: exchanges.filter(ex => ex.certified).length,
        withPro: exchanges.filter(ex => ex.pro).length,
        supportsSpotTrading: exchanges.filter(ex => ex.has.createOrder).length,
        supportsOrderBook: exchanges.filter(ex => ex.has.fetchOrderBook).length,
        supportsTicker: exchanges.filter(ex => ex.has.fetchTicker).length,
        supportsOHLCV: exchanges.filter(ex => ex.has.fetchOHLCV).length,
      }
    };
  }

  @Get('names')
  @ApiOperation({ summary: 'Get simple list of exchange names' })
  @CacheTTL(300000) // 5 minutes
  getExchangeNames() {
    return {
      exchanges: this.cryptoService.getExchangeNames(),
      count: this.cryptoService.getExchangeNames().length,
    };
  }

  @Get('info/:exchangeId')
  @ApiOperation({ summary: 'Get detailed information about a specific exchange' })
  @ApiParam({ name: 'exchangeId', example: 'binance', description: 'Exchange identifier' })
  @CacheTTL(300000) // 5 minutes
  getExchangeInfo(@Param('exchangeId') exchangeId: string) {
    return this.cryptoService.getExchangeDetails(exchangeId);
  }

  @Get(':exchangeId/usd-rates')
  @ApiOperation({ summary: 'Get USD exchange rates for top cryptocurrencies' })
  @ApiParam({ name: 'exchangeId', example: 'binance', description: 'Exchange identifier' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of cryptocurrencies to return (max 20)' })
  @CacheTTL(30000) // 30 seconds for real-time rates
  async getTopCryptoUSDRates(
    @Param('exchangeId') exchangeId: string,
    @Query('limit') limit?: number,
  ) {
    const validLimit = Math.min(Math.max(limit || 10, 1), 20); // Between 1 and 20
    return await this.cryptoService.getTopCryptoUSDRates(exchangeId, validLimit);
  }

  @Get(':exchangeId/markets')
  @ApiOperation({ summary: 'Get all markets for an exchange' })
  @ApiParam({ name: 'exchangeId', example: 'binance' })
  @CacheTTL(60000) // 1 minute
  async getMarkets(@Param('exchangeId') exchangeId: string) {
    return await this.cryptoService.getMarkets(exchangeId);
  }

  @Get(':exchangeId/ticker/:symbol')
  @ApiOperation({ summary: 'Get ticker data for a symbol' })
  @ApiParam({ name: 'exchangeId', example: 'binance' })
  @ApiParam({ name: 'symbol', example: 'BTC/USDT' })
  @CacheTTL(10000) // 10 seconds
  async getTicker(
    @Param('exchangeId') exchangeId: string,
    @Param('symbol') symbol: string,
  ) {
    return await this.cryptoService.getTicker(exchangeId, symbol);
  }

  @Get(':exchangeId/orderbook/:symbol')
  @ApiOperation({ summary: 'Get order book for a symbol' })
  @ApiParam({ name: 'exchangeId', example: 'binance' })
  @ApiParam({ name: 'symbol', example: 'BTC/USDT' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @CacheTTL(5000) // 5 seconds
  async getOrderBook(
    @Param('exchangeId') exchangeId: string,
    @Param('symbol') symbol: string,
    @Query('limit') limit?: number,
  ) {
    return await this.cryptoService.getOrderBook(exchangeId, symbol, limit);
  }

  @Get(':exchangeId/trades/:symbol')
  @ApiOperation({ summary: 'Get recent trades for a symbol' })
  @ApiParam({ name: 'exchangeId', example: 'binance' })
  @ApiParam({ name: 'symbol', example: 'BTC/USDT' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @CacheTTL(5000) // 5 seconds
  async getTrades(
    @Param('exchangeId') exchangeId: string,
    @Param('symbol') symbol: string,
    @Query('limit') limit?: number,
  ) {
    return await this.cryptoService.getTrades(exchangeId, symbol, limit);
  }
}
