import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Scope,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppLogger } from '../logger/logger';

interface ExceptionPayload {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  details?: unknown;
}

@Catch()
@Injectable({ scope: Scope.REQUEST })
export class PrettyExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(PrettyExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    const status = this.resolveStatus(exception);
    const message = this.resolveMessage(exception);
    const details = this.resolveDetails(exception);

    const payload: ExceptionPayload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(details ? { details } : {}),
    };

    this.logger.error(
      payload,
      this.extractStack(exception),
      PrettyExceptionFilter.name,
    );
    response.status(status).json(payload);
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const message = (response as Record<string, unknown>).message;
        if (Array.isArray(message)) {
          return message.join(', ');
        }
        if (typeof message === 'string') {
          return message;
        }
      }
      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    if (typeof exception === 'string') {
      return exception;
    }

    return 'Unexpected error';
  }

  private resolveDetails(exception: unknown): unknown {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const rest = { ...(response as Record<string, unknown>) };
        delete rest.message;
        return Object.keys(rest).length > 0 ? rest : undefined;
      }
      return undefined;
    }

    if (exception instanceof Error) {
      return {
        name: exception.name,
      };
    }

    return undefined;
  }

  private extractStack(exception: unknown): string | undefined {
    if (exception instanceof Error) {
      return exception.stack;
    }
    return undefined;
  }
}
