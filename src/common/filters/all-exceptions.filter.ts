import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Something went wrong';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.message;
      
      // Handle CCXT specific errors
      if (exception.name === 'NetworkError') {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Exchange network error';
      } else if (exception.name === 'ExchangeError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Exchange API error';
      } else if (exception.name === 'AuthenticationError') {
        status = HttpStatus.UNAUTHORIZED;
        message = 'Authentication failed';
      } else if (exception.name === 'InsufficientFunds') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Insufficient funds';
      } else if (exception.name === 'InvalidOrder') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid order parameters';
      }
    }

    const errorResponse: ApiResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${error}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(errorResponse);
  }
}