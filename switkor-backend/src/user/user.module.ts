import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

// Este módulo encapsula toda la lógica relacionada con usuarios
@Module({
  imports: [
    // Registramos la entidad "User" para que TypeORM la reconozca
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService], // Lógica de negocio
  controllers: [UserController], // Endpoints HTTP
  exports: [UserService], // Exportamos para que otros módulos puedan usarlo (como auth)
})
export class UserModule {}
