import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../auth/email.service';
import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { MoreThan } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  // Método para registrar un nuevo usuario
  async register(dto: RegisterDto) {
    const { email, password, name } = dto;

    // Verificamos si ya existe un usuario con ese email
    const userExists = await this.userRepo.findOneBy({ email });
    if (userExists) {
      throw new ConflictException('El email ya está registrado');
    }

    // Ciframos la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creamos y guardamos el nuevo usuario
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      name,
    });

    await this.userRepo.save(user);

    // Eliminamos la contraseña antes de devolver el usuario
    delete user.password;
    return user;
  }
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, email: user.email, name: user.name };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
    };
  }

  async sendResetEmail(email: string): Promise<{ message: string }> {
    // Buscar usuario
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      // No revelar si no existe para evitar fugas de información
      return {
        message:
          'Si existe una cuenta con ese correo, se ha enviado un enlace de recuperación.',
      };
    }

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');

    // Guardar token y expiración (ejemplo 1 hora)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600 * 1000);
    await this.userRepo.save(user);

    // Enviar email con token
    await this.emailService.sendPasswordReset(email, token);

    return {
      message:
        'Si existe una cuenta con ese correo, se ha enviado un enlace de recuperación.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Buscar usuario con token válido y no expirado
    const user = await this.userRepo.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()), // import MoreThan de typeorm
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Limpiar token y expiración
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepo.save(user);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
