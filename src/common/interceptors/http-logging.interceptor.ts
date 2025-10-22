import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../logger/logger';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    if (!request) {
      return next.handle();
    }

    const method = request.method;
    const url = request.originalUrl ?? request.url;
    const start = Date.now();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      tap({
        next: () => this.logSuccess(response, method, url, start),
        error: (err) => this.logError(response, method, url, start, err),
      }),
    );
  }

  private logSuccess(
    response: Response | undefined,
    method: string,
    url: string,
    start: number,
  ) {
    const durationMs = Date.now() - start;
    const statusCode = response?.statusCode;

    this.logger.log(
      {
        method,
        url,
        statusCode,
        durationMs,
      },
      HttpLoggingInterceptor.name,
    );
  }

  private logError(
    response: Response | undefined,
    method: string,
    url: string,
    start: number,
    error: unknown,
  ) {
    const durationMs = Date.now() - start;
    const statusCode = response?.statusCode;

    this.logger.error(
      {
        method,
        url,
        statusCode,
        durationMs,
        error,
      },
      error instanceof Error ? error.stack : undefined,
      HttpLoggingInterceptor.name,
    );
  }
}
