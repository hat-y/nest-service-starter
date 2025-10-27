import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/logger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './common/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const appLogger = await app.resolve(AppLogger);
  app.useLogger(appLogger);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Setup Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    setupSwagger(app);
  }

  await app.listen(port);

  appLogger.log(`🚀 Application is running on: http://localhost:${port}`);
  appLogger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}
void bootstrap();
