import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger, // Import Logger
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../types/api-response.type';
import { IRequestWithId } from '../interfaces/request.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name); // Create a logger instance

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<IRequestWithId>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Prepare the base error object
    const errorObject: ErrorResponse['error'] = {
      message:
        status === HttpStatus.INTERNAL_SERVER_ERROR.valueOf()
          ? 'Unable to process your request at the moment. Please try again later.'
          : message,
      code: this.getErrorCode(status),
      technicalDetails:
        status === HttpStatus.INTERNAL_SERVER_ERROR.valueOf()
          ? exception instanceof Error
            ? exception.message
            : String(exception)
          : undefined,
      timestamp: new Date().toISOString(),
    };

    // Add requestId only if it exists
    if (request.requestId) {
      errorObject.requestId = request.requestId;
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: errorObject,
    };

    // Log the error with request ID for better traceability
    const requestId = errorObject.requestId || 'unknown';
    const logMessage = `Request ID: ${requestId} - Status: ${status} - Message: ${message}`;
    if (status >= 500) {
      // Log server errors as errors
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      // Log client errors (like 400, 401, 404) as warnings
      this.logger.warn(logMessage);
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR', // Validation errors
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
    };

    return errorCodeMap[status] || 'UNKNOWN_ERROR';
  }
}
