import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Security Configuration
  helmetEnabled: process.env.HELMET_ENABLED === 'true',
  compressionEnabled: process.env.COMPRESSION_ENABLED === 'true',
  
  // Rate Limiting
  throttleTtl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  
  // Cache Configuration
  cacheTtl: parseInt(process.env.CACHE_TTL, 10) || 300,
  
  // Swagger Configuration
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    title: process.env.SWAGGER_TITLE || 'CCXT Trading API',
    description: process.env.SWAGGER_DESCRIPTION || 'A comprehensive cryptocurrency trading API built with NestJS and CCXT',
    version: process.env.SWAGGER_VERSION || '1.0.0',
  },
}));