import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  correlationId: string;
  method?: string;
  url?: string;
  userId?: string;
  ip?: string;
}

@Injectable()
export class ContextService {
  private readonly als = new AsyncLocalStorage<RequestContext>();

  /**
   * Ejecuta una función dentro de un contexto de AL S.
   * @param context Objeto con el correlationId.
   * @param next La función a ejecutar (el handler del Interceptor).
   */
  run<T>(context: RequestContext, next: () => T): T {
    return this.als.run(context, next);
  }

  /**
   * Obtiene el valor actual del correlationId desde el store.
   */
  getCorrelationId(): string | undefined {
    return this.als.getStore()?.correlationId;
  }

  /**
   * Método útil para debug: obtener todo el store
   */
  getStore(): RequestContext | undefined {
    return this.als.getStore();
  }
}
