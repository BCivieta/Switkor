import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // busca el token en el header
      ignoreExpiration: false,
      secretOrKey: 'supersecreto', // la misma clave que usaste en JwtModule
    });
  }

  // El payload lo puedes usar luego como req.user
  async validate(payload: any) {
    return this.userService.findById(payload.sub);
  }
}
