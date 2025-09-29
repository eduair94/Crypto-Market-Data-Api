import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    UseInterceptors
} from '@nestjs/common';
import {
    ApiBody,
    ApiParam,
    ApiTags
} from '@nestjs/swagger';

import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
    CancelOrderDto,
    CreateOrderDto,
    ExchangeCredentialsDto
} from './dto/exchange.dto';
import { ExchangeService } from './exchange.service';
import { MarketDataService } from './market-data.service';
import { PortfolioService } from './portfolio.service';
import { TradingService } from './trading.service';

@ApiTags('exchanges')
@Controller('exchanges')
@UseInterceptors(CacheInterceptor)
export class ExchangeController {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly marketDataService: MarketDataService,
    private readonly tradingService: TradingService,
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get()
  @ApiSuccessResponse('Get list of supported exchanges')
  @CacheTTL(300000) // 5 minutes
  async getExchanges(@Query() pagination: PaginationDto) {
    const exchanges = await this.exchangeService.listExchanges();
    const startIndex = pagination.skip;
    const endIndex = startIndex + pagination.limit;
    const paginatedExchanges = exchanges.slice(startIndex, endIndex);

    return {
      data: paginatedExchanges,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: exchanges.length,
        totalPages: Math.ceil(exchanges.length / pagination.limit),
      },
    };
  }

  @Get(':exchangeId')
  @ApiSuccessResponse('Get exchange information')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @CacheTTL(600000) // 10 minutes
  async getExchangeInfo(@Param('exchangeId') exchangeId: string) {
    return await this.exchangeService.getExchangeInfo(exchangeId);
  }

  @Get(':exchangeId/markets')
  @ApiSuccessResponse('Get exchange markets')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @CacheTTL(300000) // 5 minutes
  async getMarkets(@Param('exchangeId') exchangeId: string) {
    return await this.marketDataService.getMarkets(exchangeId);
  }

  @Get(':exchangeId/currencies')
  @ApiSuccessResponse('Get exchange currencies')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @CacheTTL(300000) // 5 minutes
  async getCurrencies(@Param('exchangeId') exchangeId: string) {
    return await this.marketDataService.getCurrencies(exchangeId);
  }

  @Get(':exchangeId/ticker/:symbol')
  @ApiSuccessResponse('Get ticker for a symbol')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiParam({ name: 'symbol', description: 'Trading symbol (e.g., BTC/USDT)' })
  @CacheTTL(10000) // 10 seconds
  async getTicker(
    @Param('exchangeId') exchangeId: string,
    @Param('symbol') symbol: string,
  ) {
    return await this.marketDataService.getTicker(exchangeId, symbol);
  }

  @Get(':exchangeId/tickers')
  @ApiSuccessResponse('Get all tickers')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @CacheTTL(30000) // 30 seconds
  async getAllTickers(@Param('exchangeId') exchangeId: string) {
    return await this.marketDataService.getAllTickers(exchangeId);
  }

  @Get(':exchangeId/orderbook/:symbol')
  @ApiSuccessResponse('Get order book for a symbol')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiParam({ name: 'symbol', description: 'Trading symbol (e.g., BTC/USDT)' })
  async getOrderBook(
    @Param('exchangeId') exchangeId: string,
    @Param('symbol') symbol: string,
    @Query('limit') limit?: number,
  ) {
    return await this.marketDataService.getOrderBook(exchangeId, symbol, limit);
  }

  @Get(':exchangeId/trades/:symbol')
  @ApiSuccessResponse('Get recent trades for a symbol')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiParam({ name: 'symbol', description: 'Trading symbol (e.g., BTC/USDT)' })
  async getTrades(
    @Param('exchangeId') exchangeId: string,
    @Param('symbol') symbol: string,
    @Query('limit') limit?: number,
  ) {
    return await this.marketDataService.getTrades(exchangeId, symbol, limit);
  }

  @Get(':exchangeId/ohlcv/:symbol')
  @ApiSuccessResponse('Get OHLCV data for a symbol')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiParam({ name: 'symbol', description: 'Trading symbol (e.g., BTC/USDT)' })
  async getOHLCV(
    @Param('exchangeId') exchangeId: string,
    @Param('symbol') symbol: string,
    @Query('timeframe') timeframe: string = '1h',
    @Query('limit') limit?: number,
  ) {
    return await this.marketDataService.getOHLCV(
      exchangeId,
      symbol,
      timeframe,
      limit,
    );
  }

  // Trading endpoints (require authentication)
  @Post(':exchangeId/balance')
  @ApiSuccessResponse('Get account balance')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({ type: ExchangeCredentialsDto })
  @HttpCode(HttpStatus.OK)
  async getBalance(
    @Param('exchangeId') exchangeId: string,
    @Body() credentials: ExchangeCredentialsDto,
  ) {
    return await this.tradingService.getBalance(exchangeId, credentials);
  }

  @Post(':exchangeId/orders')
  @ApiSuccessResponse('Create a new order')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({ 
    schema: {
      allOf: [
        { $ref: '#/components/schemas/CreateOrderDto' },
        { $ref: '#/components/schemas/ExchangeCredentialsDto' }
      ]
    }
  })
  async createOrder(
    @Param('exchangeId') exchangeId: string,
    @Body() orderData: CreateOrderDto & ExchangeCredentialsDto,
  ) {
    const { symbol, type, side, amount, price, params, ...credentials } = orderData;
    return await this.tradingService.createOrder(
      exchangeId,
      symbol,
      type,
      side,
      amount,
      price,
      params,
      credentials,
    );
  }

  @Post(':exchangeId/orders/cancel')
  @ApiSuccessResponse('Cancel an order')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({
    schema: {
      allOf: [
        { $ref: '#/components/schemas/CancelOrderDto' },
        { $ref: '#/components/schemas/ExchangeCredentialsDto' }
      ]
    }
  })
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('exchangeId') exchangeId: string,
    @Body() cancelData: CancelOrderDto & ExchangeCredentialsDto,
  ) {
    const { orderId, symbol, ...credentials } = cancelData;
    return await this.tradingService.cancelOrder(
      exchangeId,
      orderId,
      symbol,
      credentials,
    );
  }

  @Post(':exchangeId/orders/:orderId')
  @ApiSuccessResponse('Get order details')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiParam({ name: 'orderId', description: 'Order identifier' })
  @ApiBody({ type: ExchangeCredentialsDto })
  @HttpCode(HttpStatus.OK)
  async getOrder(
    @Param('exchangeId') exchangeId: string,
    @Param('orderId') orderId: string,
    @Body() credentials: ExchangeCredentialsDto,
    @Query('symbol') symbol?: string,
  ) {
    return await this.tradingService.getOrder(
      exchangeId,
      orderId,
      symbol,
      credentials,
    );
  }

  @Post(':exchangeId/orders/history')
  @ApiSuccessResponse('Get order history')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({ type: ExchangeCredentialsDto })
  @HttpCode(HttpStatus.OK)
  async getOrders(
    @Param('exchangeId') exchangeId: string,
    @Body() credentials: ExchangeCredentialsDto,
    @Query('symbol') symbol?: string,
    @Query('limit') limit?: number,
  ) {
    return await this.tradingService.getOrders(
      exchangeId,
      symbol,
      limit,
      credentials,
    );
  }

  @Post(':exchangeId/orders/open')
  @ApiSuccessResponse('Get open orders')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({ type: ExchangeCredentialsDto })
  @HttpCode(HttpStatus.OK)
  async getOpenOrders(
    @Param('exchangeId') exchangeId: string,
    @Body() credentials: ExchangeCredentialsDto,
    @Query('symbol') symbol?: string,
  ) {
    return await this.tradingService.getOpenOrders(
      exchangeId,
      symbol,
      credentials,
    );
  }

  @Post(':exchangeId/trades/my')
  @ApiSuccessResponse('Get my trades')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({ type: ExchangeCredentialsDto })
  @HttpCode(HttpStatus.OK)
  async getMyTrades(
    @Param('exchangeId') exchangeId: string,
    @Body() credentials: ExchangeCredentialsDto,
    @Query('symbol') symbol?: string,
    @Query('limit') limit?: number,
  ) {
    return await this.tradingService.getMyTrades(
      exchangeId,
      symbol,
      limit,
      credentials,
    );
  }

  // Portfolio endpoints
  @Post(':exchangeId/portfolio')
  @ApiSuccessResponse('Get portfolio overview')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({ type: ExchangeCredentialsDto })
  @HttpCode(HttpStatus.OK)
  async getPortfolio(
    @Param('exchangeId') exchangeId: string,
    @Body() credentials: ExchangeCredentialsDto,
  ) {
    return await this.portfolioService.getPortfolio(exchangeId, credentials);
  }

  @Post(':exchangeId/positions')
  @ApiSuccessResponse('Get positions')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({ type: ExchangeCredentialsDto })
  @HttpCode(HttpStatus.OK)
  async getPositions(
    @Param('exchangeId') exchangeId: string,
    @Body() credentials: ExchangeCredentialsDto,
  ) {
    return await this.portfolioService.getPositions(exchangeId, credentials);
  }

  @Post(':exchangeId/trading-history')
  @ApiSuccessResponse('Get trading history')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({ type: ExchangeCredentialsDto })
  @HttpCode(HttpStatus.OK)
  async getTradingHistory(
    @Param('exchangeId') exchangeId: string,
    @Body() credentials: ExchangeCredentialsDto,
    @Query('symbol') symbol?: string,
  ) {
    return await this.portfolioService.getTradingHistory(
      exchangeId,
      symbol,
      credentials,
    );
  }

  @Post(':exchangeId/profit-loss')
  @ApiSuccessResponse('Get profit and loss analysis')
  @ApiParam({ name: 'exchangeId', description: 'Exchange identifier' })
  @ApiBody({ type: ExchangeCredentialsDto })
  @HttpCode(HttpStatus.OK)
  async getProfitLoss(
    @Param('exchangeId') exchangeId: string,
    @Body() credentials: ExchangeCredentialsDto,
    @Query('symbol') symbol?: string,
  ) {
    return await this.portfolioService.getProfitLoss(
      exchangeId,
      symbol,
      credentials,
    );
  }
}