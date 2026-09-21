import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Guess Graph API rodando em http://localhost:${port}`);
}
void bootstrap();
