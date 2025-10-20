// Modulos Externos
import { Module, Global, Logger } from '@nestjs/common';
import pino from 'pino';

// Modulos Internos 
import { AppLogger, PINO_LOGGER_TOKEN } from './logger';
import { ContextService } from '../context/context.service';
import { ContextModule } from '../context/context.module';

@Global()
@Module({
  imports: [ContextModule],
  providers: [
    {
      provide: PINO_LOGGER_TOKEN,
      useFactory: (contextService: ContextService) => {
        const transport = process.env.NODE_ENV !== 'production'
          ? {
            target: 'pino-pretty',
            options: {
              ignore: 'pid,hostname,app,context,correlationId',

              messageFormat: `
              [{context}] 
              {correlationId} 
              {msg}
              `,
              colorize: true,
              levelFirst: true,
              translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            },
          }
          : undefined;

        return pino({
          level: process.env.LOG_LEVEL ?? 'info',
          transport: transport,

          base: {
            app: process.env.npm_package_name || 'nestjs-app',
          },

          hooks: {
            logMethod(input: any[], method: (obj: any, msg?: string, ...args: any[]) => void) {
              const logObject = typeof input[0] === 'object' && input[0] !== null ? input.shift() : {};

              const correlationId = contextService.getCorrelationId() || 'SYS';

              if (correlationId) {
                logObject.correlationId = correlationId;
              }
              return method.apply(this, [logObject, input[0], ...input.slice(1)]);
            },
          },
        });
      },
      inject: [ContextService]
    },
    {
      provide: AppLogger,
      useFactory: (p: pino.Logger) => new AppLogger(p),
      inject: [PINO_LOGGER_TOKEN]
    },
    {
      provide: Logger,
      useExisting: AppLogger
    }
  ],
  exports: [AppLogger, Logger],
})
export class LoggerModule { }
