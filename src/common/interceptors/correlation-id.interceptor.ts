import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ContextService, RequestContext } from '../context/context.service';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  constructor(
    private readonly contextService: ContextService,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    const correlationId = request.headers['x-request-id'] || uuidv4();

    response.setHeader('X-Request-ID', correlationId);
    const contextStore: RequestContext = { correlationId };

    return this.contextService.run(contextStore, () => next.handle());
  }
}
