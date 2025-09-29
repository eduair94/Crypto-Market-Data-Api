import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiSuccessResponse(
  message: string,
  type?: any,
  isArray = false,
) {
  return applyDecorators(
    ApiOperation({ summary: message }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: isArray ? [type] : type,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Bad Request' },
          error: { type: 'string', example: 'Validation failed' },
          timestamp: { type: 'string', example: '2023-12-01T10:00:00.000Z' },
          path: { type: 'string', example: '/api/v1/exchanges' },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Internal Server Error' },
          error: { type: 'string', example: 'Something went wrong' },
          timestamp: { type: 'string', example: '2023-12-01T10:00:00.000Z' },
          path: { type: 'string', example: '/api/v1/exchanges' },
        },
      },
    }),
  );
}