import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../users/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', 'default_secret'),
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuarioRepo.findOne({
      where: { idUsuario: payload.sub },
    });
    if (!usuario || usuario.estado === 'INACTIVO') {
      throw new UnauthorizedException();
    }
    return {
      idUsuario: usuario.idUsuario,
      correo: usuario.correo,
      rol: usuario.rol,
      ciExpositor: usuario.ciExpositor,
    };
  }
}
