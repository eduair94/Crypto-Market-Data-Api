import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', example: '2023-12-01T10:00:00.000Z' },
            uptime: { type: 'number', example: 3600 },
            version: { type: 'string', example: '1.0.0' },
            environment: { type: 'string', example: 'development' },
            ccxtVersion: { type: 'string', example: '4.5.6' },
            supportedExchanges: { type: 'number', example: 103 },
          },
        },
      },
    },
  })
  async check() {
    return await this.healthService.check();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with system information' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
  })
  async detailedCheck() {
    return await this.healthService.detailedCheck();
  }
}