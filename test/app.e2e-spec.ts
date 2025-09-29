import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('ok');
      });
  });

  it('/exchanges (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/exchanges')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.data)).toBe(true);
      });
  });

  it('/exchanges/binance (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/exchanges/binance')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe('binance');
      });
  });

  it('/exchanges/binance/ticker/BTC/USDT (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/exchanges/binance/ticker/BTC/USDT')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.symbol).toBe('BTC/USDT');
      });
  });
});