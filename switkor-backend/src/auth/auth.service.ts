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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
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
}
