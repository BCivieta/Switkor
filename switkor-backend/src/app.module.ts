// Importamos el decorador @Module de NestJS, necesario para definir el módulo principal
import { Module } from '@nestjs/common';

// Importamos el módulo de TypeORM que usaremos para conectar con la base de datos
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ExerciseModule } from './exercise/exercise.module';
import { TrainingPlanModule } from './training-plan/training-plan.module';
import { TrainingSessionModule } from './training-session/training-session.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), //habilita el uso de process.env
    // Configuramos la conexión a la base de datos usando TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 👈 solo en desarrollo
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    UserModule,
    AuthModule,
    ExerciseModule,
    TrainingPlanModule,
    TrainingSessionModule,
  ],
})
export class AppModule {}
