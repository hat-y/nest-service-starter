import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ContextService, RequestContext } from '../context/context.service';

type RequestUser =
  | string
  | (Partial<Record<'id' | 'sub' | '_id' | 'email', string>> &
      Record<string, unknown>)
  | undefined;

interface RequestWithUser extends Request {
  user?: RequestUser;
}

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  constructor(private readonly contextService: ContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithUser>();
    const response = httpContext.getResponse<Response>();

    const requestIdHeader = request.headers['x-request-id'];
    const correlationId =
      (typeof requestIdHeader === 'string'
        ? requestIdHeader
        : Array.isArray(requestIdHeader)
          ? requestIdHeader[0]
          : undefined) ?? uuidv4();

    const method = request.method;
    const url = request.originalUrl ?? request.url;
    const ip =
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress;

    const user = request.user;
    const userId =
      typeof user === 'string'
        ? user
        : user && typeof user === 'object'
          ? (user.id ?? user.sub ?? user._id ?? user.email)
          : undefined;

    response.setHeader('X-Request-ID', correlationId);
    const contextStore: RequestContext = {
      correlationId,
      method,
      url,
      ip,
      userId,
    };

    return this.contextService.run(contextStore, () => next.handle());
  }
}
