import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../users/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usuarioRepo.findOne({ where: { correo: dto.correo } });
    if (existing) {
      throw new UnauthorizedException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuarioRepo.create({
      correo: dto.correo,
      passwordHash,
    });
    const saved = await this.usuarioRepo.save(usuario);
    return this.buildResponse(saved);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: { correo: dto.correo },
      relations: { expositor: true },
    });

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');
    if (usuario.estado === 'INACTIVO') throw new UnauthorizedException('Usuario inactivo');

    const valid = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = {
      sub: usuario.idUsuario,
      correo: usuario.correo,
      rol: usuario.rol,
      ciExpositor: usuario.ciExpositor,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.buildResponse(usuario),
    };
  }

  private buildResponse(usuario: Usuario) {
    return {
      idUsuario: usuario.idUsuario,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      esExpositor: !!usuario.ciExpositor,
      expositor: usuario.expositor
        ? {
            ci: usuario.expositor.ciExpositor,
            nombre: usuario.expositor.nombre,
            paterno: usuario.expositor.paterno,
            materno: usuario.expositor.materno,
          }
        : null,
    };
  }
}
