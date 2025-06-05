import { Controller, Post, Body } from '@nestjs/common';
// - Controller: para declarar que esta clase va a manejar rutas (endpoints HTTP)
// - Post: para declarar rutas tipo POST (como para enviar datos al servidor)
// - Body: para leer datos del cuerpo de la petición HTTP (lo que envía el cliente en JSON)

// Importamos nuestro servicio de autenticación, que contiene la lógica
import { AuthService } from './auth.service';
//Importamos el DTO que define la forma que deben tener los datos del registro
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Decorador que define un controlador con prefijo de ruta "/auth"
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // Inyectamos el servicio AuthService que contiene la lógica del registro, login, etc.
  // Endpoint POST /auth/register
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
