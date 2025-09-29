import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ccxt from 'ccxt';
import * as os from 'os';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV', 'development'),
      ccxtVersion: ccxt.version,
      supportedExchanges: Object.keys(ccxt.exchanges).length,
    };
  }

  async detailedCheck() {
    const basicCheck = await this.check();
    
    return {
      ...basicCheck,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
        loadAverage: os.loadavg(),
      },
      config: {
        port: this.configService.get('PORT', 3000),
        apiPrefix: this.configService.get('API_PREFIX', 'api/v1'),
        swaggerEnabled: this.configService.get('SWAGGER_ENABLED', true),
        cacheTtl: this.configService.get('CACHE_TTL', 300),
        throttleLimit: this.configService.get('THROTTLE_LIMIT', 100),
      },
      exchanges: {
        total: Object.keys(ccxt.exchanges).length,
        certified: Object.keys(ccxt.exchanges).filter(id => {
          try {
            const ExchangeClass = ccxt[id];
            return new ExchangeClass().certified === true;
          } catch {
            return false;
          }
        }).length,
        pro: Object.keys(ccxt.exchanges).filter(id => {
          try {
            const ExchangeClass = ccxt[id];
            return new ExchangeClass().pro === true;
          } catch {
            return false;
          }
        }).length,
      },
    };
  }
}