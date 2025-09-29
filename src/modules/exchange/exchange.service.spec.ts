import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeService } from './exchange.service';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                'exchanges.binance': {
                  apiKey: 'test-key',
                  secret: 'test-secret',
                  sandbox: true,
                },
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list exchanges', async () => {
    const exchanges = await service.listExchanges();
    expect(Array.isArray(exchanges)).toBe(true);
    expect(exchanges.length).toBeGreaterThan(0);
    expect(exchanges).toContain('binance');
  });

  it('should check if exchange is supported', () => {
    expect(service.isExchangeSupported('binance')).toBe(true);
    expect(service.isExchangeSupported('nonexistent')).toBe(false);
  });

  it('should get exchange info', async () => {
    const info = await service.getExchangeInfo('binance');
    expect(info).toBeDefined();
    expect(info.id).toBe('binance');
    expect(info.name).toBeDefined();
  });

  it('should throw error for unsupported exchange', async () => {
    await expect(service.getExchangeInfo('nonexistent')).rejects.toThrow();
  });

  it('should create exchange instance', async () => {
    const instance = await service.createExchangeInstance('binance');
    expect(instance).toBeDefined();
    expect(instance.id).toBe('binance');
  });
});