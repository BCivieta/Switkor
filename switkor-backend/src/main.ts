import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔐 Habilita CORS para permitir comunicación con el frontend
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((s) => s.trim())
    : [];

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : [/\.vercel\.app$/],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: [], // no es necesario exponer nada si el token va en el body
    credentials: false, // no usas cookies
    optionsSuccessStatus: 204,
  });
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
