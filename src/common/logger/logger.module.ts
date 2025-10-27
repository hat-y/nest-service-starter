// Modulos Externos
import { Module, Global, Logger } from '@nestjs/common';
import pino, { type LoggerOptions } from 'pino';
import { ConfigService } from '@nestjs/config';

// Modulos Internos
import { AppLogger, PINO_LOGGER_TOKEN } from './logger';
import { ContextService } from '../context/context.service';
import { ContextModule } from '../context/context.module';
import { Env } from '../config/env.schema';

@Global()
@Module({
  imports: [ContextModule],
  providers: [
    {
      provide: PINO_LOGGER_TOKEN,
      useFactory: (
        contextService: ContextService,
        configService: ConfigService<Env, true>,
      ) => {
        const nodeEnv =
          configService.get<'development' | 'test' | 'production'>('NODE_ENV', {
            infer: true,
          }) ?? 'development';

        const transport: LoggerOptions['transport'] =
          nodeEnv !== 'production'
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
            : {
                target: 'pino-pretty',
                options: {
                  colorize: false,
                  levelFirst: true,
                  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                  destination: 1, // stdout - puede ser redirigido a archivo por systemd/docker
                  messageFormat: '[{context}] {correlationId} {msg}',
                },
              };

        const logLevel =
          configService.get<
            'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
          >('LOG_LEVEL', { infer: true }) ?? 'info';

        return pino({
          level: logLevel,
          transport: transport,

          base: {
            app: process.env.npm_package_name || 'nestjs-app',
            version: process.env.npm_package_version || '1.0.0',
            environment: nodeEnv,
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
      inject: [ContextService, ConfigService],
    },
    {
      provide: AppLogger,
      useClass: AppLogger,
    },
    {
      provide: Logger,
      useExisting: AppLogger,
    },
  ],
  exports: [AppLogger, Logger],
})
export class LoggerModule {}
