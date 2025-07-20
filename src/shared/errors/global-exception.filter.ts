import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';

const logger = new Logger('GlobalExceptionFilter');

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (
      exception instanceof HttpException ||
      exception instanceof ForbiddenException
    ) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message =
        typeof responseBody === 'string'
          ? responseBody
          : (responseBody as { message: string }).message || message;
    }

    if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as { code: string }).code === 'EBADCSRFTOKEN'
    ) {
      status = 403;
      message = 'ForbiddenError: invalid csrf token';
    }

    const stack =
      typeof exception === 'object' &&
      exception !== null &&
      'stack' in exception &&
      typeof (exception as { stack: unknown }).stack === 'string'
        ? exception.stack
        : exception;

    logger.error(
      `Error processing request ${request.method} ${request.url}`,
      stack,
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
