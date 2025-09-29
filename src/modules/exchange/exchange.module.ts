import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { MarketDataService } from './market-data.service';
import { PortfolioService } from './portfolio.service';
import { TradingService } from './trading.service';

@Module({
  controllers: [ExchangeController],
  providers: [
    ExchangeService,
    MarketDataService,
    TradingService,
    PortfolioService,
  ],
  exports: [
    ExchangeService,
    MarketDataService,
    TradingService,
    PortfolioService,
  ],
})
export class ExchangeModule {}