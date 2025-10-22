import { ConsoleLogger, Inject, Injectable, Scope } from '@nestjs/common';
import { type Logger as PinoLogger } from 'pino';

export const PINO_LOGGER_TOKEN = Symbol('PINO_LOGGER_TOKEN');

@Injectable({ scope: Scope.REQUEST }) // Scope.TRANSIENT permite inyectar el contexto de la petición
export class AppLogger extends ConsoleLogger {
  constructor(@Inject(PINO_LOGGER_TOKEN) private readonly pino: PinoLogger) {
    super();
  }

  log(message: unknown, context?: string) {
    const { meta, msg } = this.preparePayload(message, context);
    this.pino.info(meta, msg);
  }

  error(message: unknown, trace?: string, context?: string) {
    const { meta, msg } = this.preparePayload(
      message,
      context,
      trace ? { trace } : undefined,
    );
    this.pino.error(meta, msg);
  }

  warn(message: unknown, context?: string) {
    const { meta, msg } = this.preparePayload(message, context);
    this.pino.warn(meta, msg);
  }

  debug(message: unknown, context?: string) {
    const { meta, msg } = this.preparePayload(message, context);
    this.pino.debug(meta, msg);
  }

  verbose(message: unknown, context?: string) {
    const { meta, msg } = this.preparePayload(message, context);
    this.pino.trace(meta, msg);
  }

  fatal(message: unknown, context?: string) {
    const { meta, msg } = this.preparePayload(message, context);
    this.pino.fatal(meta, msg);
  }

  private preparePayload(
    message: unknown,
    context?: string,
    extra?: Record<string, unknown>,
  ): { meta: Record<string, unknown>; msg?: string } {
    const meta: Record<string, unknown> = {
      context: context || this.context,
      ...extra,
    };

    if (message instanceof Error) {
      meta.err = this.normalizeError(message);
      return { meta, msg: message.message };
    }

    if (typeof message === 'object' && message !== null) {
      return this.prepareFromObjectMessage(
        meta,
        message as Record<string, unknown>,
      );
    }

    const msg = this.stringifyScalar(message);
    if (msg === undefined) {
      return { meta };
    }

    return { meta, msg };
  }

  private prepareFromObjectMessage(
    meta: Record<string, unknown>,
    message: Record<string, unknown>,
  ): { meta: Record<string, unknown>; msg?: string } {
    const cloned = { ...message };
    const explicitMsg = this.extractPrimaryMessage(cloned);
    const structuredDetails = {
      ...cloned,
      ...this.extractErrorDetails(cloned),
    };
    const structuredKeys = Object.keys(structuredDetails);
    if (structuredKeys.length > 0) {
      Object.defineProperty(meta, 'structured', {
        value: structuredDetails,
        enumerable: false,
        configurable: true,
        writable: false,
      });
    }

    const details = this.formatDetails(structuredDetails) ?? '';

    if (details) {
      Object.defineProperty(meta, 'details', {
        value: details,
        enumerable: false,
        configurable: true,
        writable: false,
      });
    }

    const compositeMessage = [explicitMsg, details].filter(Boolean).join('\n');

    return {
      meta,
      msg: compositeMessage || undefined,
    };
  }

  private extractPrimaryMessage(
    payload: Record<string, unknown>,
  ): string | undefined {
    const candidates: Array<string | undefined> = [];

    if (typeof payload.msg === 'string') {
      candidates.push(payload.msg);
    }
    if (typeof payload.message === 'string') {
      candidates.push(payload.message);
    }
    if (payload.error instanceof Error) {
      candidates.push(payload.error.message);
    }
    if (payload.err instanceof Error) {
      candidates.push(payload.err.message);
    }

    delete payload.msg;
    delete payload.message;

    return candidates.find(
      (candidate) => candidate && candidate.trim().length > 0,
    );
  }

  private extractErrorDetails(
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    const errorLike = payload.error ?? payload.err;

    delete payload.error;
    delete payload.err;

    if (!errorLike) {
      return {};
    }

    if (errorLike instanceof Error) {
      return { error: this.normalizeError(errorLike) };
    }

    if (typeof errorLike === 'object' && errorLike !== null) {
      return { error: errorLike as Record<string, unknown> };
    }

    return { error: { message: this.stringifyScalar(errorLike) } };
  }

  private normalizeError(error: Error): Record<string, unknown> {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  private formatDetails(details: Record<string, unknown>): string | undefined {
    const entries = Object.entries(details).filter(
      ([, value]) => value !== undefined,
    );

    if (entries.length === 0) {
      return undefined;
    }

    const lines = entries.map(([key, value]) => {
      const serialized = this.stringifyValue(value);
      return `  • ${key}: ${serialized}`;
    });

    return `Detalles:\n${lines.join('\n')}`;
  }

  private stringifyScalar(value: unknown): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return 'null';
    }

    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return value.toString();
    }

    if (typeof value === 'symbol') {
      return value.toString();
    }

    if (typeof value === 'function') {
      return value.name || '[anonymous function]';
    }

    if (typeof value === 'string') {
      return value;
    }

    return undefined;
  }

  private stringifyValue(value: unknown): string {
    if (value instanceof Error) {
      return JSON.stringify(this.normalizeError(value), null, 2);
    }

    const scalar = this.stringifyScalar(value);
    if (scalar !== undefined) {
      return scalar;
    }

    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Unserializable Object]';
      }
    }

    return '[Unknown]';
  }
}
