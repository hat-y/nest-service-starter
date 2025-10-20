import { ConsoleLogger, Inject, Injectable, Scope } from '@nestjs/common';
import { type Logger as PinoLogger } from 'pino';

export const PINO_LOGGER_TOKEN = Symbol('PINO_LOGGER_TOKEN');

@Injectable({ scope: Scope.TRANSIENT }) // Scope.TRANSIENT permite inyectar el contexto de la petición
export class AppLogger extends ConsoleLogger {
  constructor(
    @Inject(PINO_LOGGER_TOKEN) private readonly pino: PinoLogger,
  ) {
    super();
  }

  /*
    *
    * */
  log(message: any, context?: string) {
    this.pino.info({ context: context || this.context }, message);
  }

  /*
    *
    * */
  error(message: any, trace?: string, context?: string) {
    this.pino.error({ trace, context: context || this.context }, message);
  }

  /*
  *
  * */
  warn(message: any, context?: string) {
    this.pino.warn({ context: context || this.context }, message);
  }

}
