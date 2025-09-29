import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Trading symbol (e.g., BTC/USDT)',
    example: 'BTC/USDT',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Order type',
    enum: ['market', 'limit', 'stop', 'stop-limit'],
    example: 'limit',
  })
  @IsString()
  @IsIn(['market', 'limit', 'stop', 'stop-limit'])
  type: string;

  @ApiProperty({
    description: 'Order side',
    enum: ['buy', 'sell'],
    example: 'buy',
  })
  @IsString()
  @IsIn(['buy', 'sell'])
  side: string;

  @ApiProperty({
    description: 'Order amount',
    example: 0.001,
    minimum: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Order price (required for limit orders)',
    example: 50000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Additional order parameters',
    example: { timeInForce: 'GTC' },
    required: false,
  })
  @IsOptional()
  params?: any;
}

export class GetOrderBookDto {
  @ApiProperty({
    description: 'Trading symbol',
    example: 'BTC/USDT',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Number of price levels to return',
    example: 20,
    minimum: 1,
    maximum: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class GetOHLCVDto {
  @ApiProperty({
    description: 'Trading symbol',
    example: 'BTC/USDT',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Timeframe',
    enum: ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
    example: '1h',
  })
  @IsString()
  @IsIn(['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'])
  timeframe: string;

  @ApiProperty({
    description: 'Number of candles to return',
    example: 100,
    minimum: 1,
    maximum: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class ExchangeCredentialsDto {
  @ApiProperty({
    description: 'Exchange API key',
    example: 'your_api_key_here',
    required: false,
  })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({
    description: 'Exchange API secret',
    example: 'your_api_secret_here',
    required: false,
  })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiProperty({
    description: 'Use sandbox/testnet environment',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sandbox?: boolean;

  @ApiProperty({
    description: 'API passphrase (for some exchanges like Coinbase Pro)',
    example: 'your_passphrase',
    required: false,
  })
  @IsOptional()
  @IsString()
  passphrase?: string;
}

export class GetTradesDto {
  @ApiProperty({
    description: 'Trading symbol',
    example: 'BTC/USDT',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Number of trades to return',
    example: 50,
    minimum: 1,
    maximum: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class CancelOrderDto {
  @ApiProperty({
    description: 'Order ID to cancel',
    example: '12345678',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Trading symbol (required for some exchanges)',
    example: 'BTC/USDT',
    required: false,
  })
  @IsOptional()
  @IsString()
  symbol?: string;
}