// Importamos el decorador @Module de NestJS, necesario para definir el módulo principal
import { Module } from '@nestjs/common';

// Importamos el módulo de TypeORM que usaremos para conectar con la base de datos
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ExerciseModule } from './exercise/exercise.module';
import { TrainingPlanModule } from './training-plan/training-plan.module';

@Module({
  imports: [
    // Configuramos la conexión a la base de datos usando TypeORM
    TypeOrmModule.forRoot({
      type: 'sqlite', // Tipo de base de datos: SQLite
      database: 'switkor-dev.db', // Nombre del archivo donde se guardará la base de datos local

      // Esta línea busca automáticamente todas las entidades (tablas) que definamos
      // en cualquier archivo que termine en .entity.ts o .entity.js
      entities: [__dirname + '/**/*.entity{.ts,.js}'],

      // Esta opción crea automáticamente las tablas basándose en las entidades.
      // ¡Úsalo solo en desarrollo! En producción se deben usar migraciones.
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    ExerciseModule,
    TrainingPlanModule,
  ],
})
export class AppModule {}
