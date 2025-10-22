import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(AppLogger));

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
