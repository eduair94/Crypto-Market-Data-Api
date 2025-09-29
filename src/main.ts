import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Crypto Market Data API')
    .setDescription('Simple API for real-time cryptocurrency market data from multiple exchanges')
    .setVersion('1.0.0')
    .addTag('exchanges', 'Available exchanges')
    .addTag('market-data', 'Real-time market data')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Crypto Market Data API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
  console.log(`📊 Example: http://localhost:${port}/api/exchanges/binance/ticker/BTC/USDT`);
}

bootstrap();