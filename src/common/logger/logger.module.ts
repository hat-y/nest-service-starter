// Modulos Externos
import { Module, Global, Logger } from '@nestjs/common';
import pino, { type LoggerOptions } from 'pino';

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
        const transport: LoggerOptions['transport'] =
          process.env.NODE_ENV !== 'production'
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
            logMethod(
              input: unknown[],
              method: (
                obj: Record<string, unknown>,
                msg?: string,
                ...args: unknown[]
              ) => void,
            ) {
              const args = [...input];
              const logObject: Record<string, unknown> = {};

              if (
                typeof args[0] === 'object' &&
                args[0] !== null &&
                !Array.isArray(args[0])
              ) {
                Object.assign(
                  logObject,
                  args.shift() as Record<string, unknown>,
                );
              }

              const store = contextService.getStore();
              const correlationId = store?.correlationId || 'SYS';

              logObject.correlationId = correlationId;

              if (store?.method) {
                logObject.method = store.method;
              }
              if (store?.url) {
                logObject.url = store.url;
              }
              if (store?.userId) {
                logObject.userId = store.userId;
              }
              if (store?.ip) {
                logObject.ip = store.ip;
              }

              method.apply(this, [logObject, ...args]);
            },
          },
        });
      },
      inject: [ContextService],
    },
    {
      provide: AppLogger,
      useFactory: (p: pino.Logger) => new AppLogger(p),
      inject: [PINO_LOGGER_TOKEN],
    },
    {
      provide: Logger,
      useExisting: AppLogger,
    },
  ],
  exports: [AppLogger, Logger],
})
export class LoggerModule {}
