import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Enhanced in-memory caching optimized for concurrent requests
    CacheModule.register({
      isGlobal: true,
      ttl: 30 * 1000, // 30 seconds cache for real-time data
      max: 1000, // Maximum items in cache to prevent memory issues
    }),
    
    // Main crypto module
    CryptoModule,
  ],
})
export class AppModule {}