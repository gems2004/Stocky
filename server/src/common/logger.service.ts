import {
  Injectable,
  LoggerService as NestLoggerService,
  Scope,
  Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston';
import { IRequestWithId } from './interfaces/request.interface';

const { combine, timestamp, printf, colorize, errors } = format;

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private readonly logger: WinstonLogger;

  constructor(@Inject(REQUEST) private readonly request: IRequestWithId) {
    const logFormat = printf(({ level, message, timestamp, stack }) => {
      // Ensure safe string representations
      const safeTimestamp = timestamp || new Date().toISOString();
      const safeLevel = level || 'info';
      const safeMessage =
        typeof message === 'string' ? message : JSON.stringify(message);
      const safeStack = stack || '';
      const safeRequestId = request?.requestId || '';

      const requestIdPart = safeRequestId ? `[${safeRequestId}] ` : '';
      return `${safeTimestamp} ${safeLevel}: ${requestIdPart} ${safeStack || safeMessage}`;
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const consoleFormat = isProduction
      ? logFormat
      : combine(
          colorize({
            all: true,
            colors: {
              info: 'blue',
              error: 'red',
              warn: 'yellow',
              debug: 'green',
            },
          }),
          logFormat,
        );

    this.logger = createLogger({
      level: isProduction ? 'info' : 'debug',
      format: combine(errors({ stack: true }), timestamp(), logFormat),
      transports: [
        new transports.Console({
          format: combine(errors({ stack: true }), timestamp(), consoleFormat),
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/warn.log', level: 'warn' }),
        new transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }

  private logWithRequestId(
    level: string,
    message: string,
    meta?: Record<string, any>,
  ) {
    const requestId = this.request?.requestId;
    this.logger.log(level, message, { ...meta, requestId });
  }

  log(message: string) {
    this.logWithRequestId('info', message);
  }

  error(message: string, trace?: string) {
    this.logWithRequestId('error', message, { stack: trace });
  }

  warn(message: string) {
    this.logWithRequestId('warn', message);
  }

  debug(message: string) {
    this.logWithRequestId('debug', message);
  }

  verbose(message: string) {
    this.logWithRequestId('verbose', message);
  }
}
