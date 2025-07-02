import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔐 Habilita CORS para permitir comunicación con el frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? [],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
