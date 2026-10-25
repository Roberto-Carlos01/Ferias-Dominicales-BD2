import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, UserRole, UserStatus } from './usuario.entity';
import { Expositor } from '../expositores/expositor.entity';
import { Conforman } from '../participantes/conforman.entity';
import { Ofrece } from '../ofertas/ofrece.entity';
import { Exposicion } from '../exposiciones/exposicion.entity';
import { Organiza } from '../organizadores/organiza.entity';
import { Patrocina } from '../patrocinadores/patrocina.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Expositor)
    private readonly expositorRepo: Repository<Expositor>,
    @InjectRepository(Conforman)
    private readonly conformanRepo: Repository<Conforman>,
    @InjectRepository(Ofrece)
    private readonly ofreceRepo: Repository<Ofrece>,
    @InjectRepository(Exposicion)
    private readonly exposicionRepo: Repository<Exposicion>,
    @InjectRepository(Organiza)
    private readonly organizaRepo: Repository<Organiza>,
    @InjectRepository(Patrocina)
    private readonly patrocinaRepo: Repository<Patrocina>,
  ) {}

  async onModuleInit() {
    // Sembrar usuarios por defecto (admins, expositores y visitantes)
    try {
      const defaultUsers = [
        { correo: 'admin@ferias.gob.bo', pass: 'Admin1234!', rol: UserRole.ADMIN, ci: null },
        { correo: 'superadmin@ferias.gob.bo', pass: 'Admin1234!', rol: UserRole.ADMIN, ci: null },
        { correo: 'alcaldia.admin@lapaz.bo', pass: 'Admin1234!', rol: UserRole.ADMIN, ci: null },
        { correo: 'oscar.chavez@ferias.bo', pass: 'Expositor1234!', rol: UserRole.USUARIO, ci: '1018225L' },
        { correo: 'tomas.apaza@ferias.bo', pass: 'Expositor1234!', rol: UserRole.USUARIO, ci: '1020136P' },
        { correo: 'katia.escobar@ferias.bo', pass: 'Expositor1234!', rol: UserRole.USUARIO, ci: '1135267P' },
        { correo: 'ciudadano@ferias.bo', pass: 'Usuario1234!', rol: UserRole.USUARIO, ci: null },
        { correo: 'visitante@gmail.com', pass: 'Usuario1234!', rol: UserRole.USUARIO, ci: null },
      ];

      for (const u of defaultUsers) {
        const exists = await this.usuarioRepo.findOne({ where: { correo: u.correo } });
        if (!exists) {
          const hash = await bcrypt.hash(u.pass, 10);
          const user = this.usuarioRepo.create({
            correo: u.correo,
            passwordHash: hash,
            rol: u.rol,
            estado: UserStatus.ACTIVO,
            ciExpositor: u.ci,
          });
          await this.usuarioRepo.save(user);
          console.log(`✅ Usuario por defecto creado: ${u.correo} (${u.rol})`);
        }
      }
    } catch (err) {
      console.warn('⚠️ No se pudieron sembrar los usuarios por defecto:', (err as any)?.message);
    }
  }

  async findAll(pagination: PaginationDto, search?: string, rol?: UserRole, sinExpositor?: boolean, soloExpositores?: boolean) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.expositor', 'e')
      .orderBy('u.idUsuario', 'DESC');

    if (search) {
      qb.andWhere(
        '(u.correo LIKE :search OR e.nombre LIKE :search OR e.paterno LIKE :search OR e.ciExpositor LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (rol) {
      qb.andWhere('u.rol = :rol', { rol });
    }

    if (sinExpositor) {
      qb.andWhere('u.ciExpositor IS NULL');
    } else if (soloExpositores) {
      qb.andWhere('u.ciExpositor IS NOT NULL');
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((u) => this.sanitize(u)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.usuarioRepo.findOne({
      where: { idUsuario: id },
      relations: { expositor: true },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return this.sanitize(user);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usuarioRepo.findOne({ where: { correo: dto.correo } });
    if (existing) {
      throw new ConflictException('El correo ya está en uso');
    }

    if (dto.ciExpositor) {
      const exp = await this.expositorRepo.findOne({ where: { ciExpositor: dto.ciExpositor } });
      if (!exp) {
        throw new BadRequestException(`El expositor con CI ${dto.ciExpositor} no existe`);
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usuarioRepo.create({
      correo: dto.correo,
      passwordHash,
      rol: dto.rol || UserRole.USUARIO,
      estado: dto.estado || UserStatus.ACTIVO,
      ciExpositor: dto.ciExpositor || null,
    });

    const saved = await this.usuarioRepo.save(user);
    return this.findOne(saved.idUsuario);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usuarioRepo.findOne({ where: { idUsuario: id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    if (dto.correo && dto.correo !== user.correo) {
      const existing = await this.usuarioRepo.findOne({ where: { correo: dto.correo } });
      if (existing) throw new ConflictException('El correo ya está en uso');
      user.correo = dto.correo;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.rol) user.rol = dto.rol;
    if (dto.estado) user.estado = dto.estado;
    if (dto.ciExpositor !== undefined) {
      if (dto.ciExpositor) {
        const exp = await this.expositorRepo.findOne({ where: { ciExpositor: dto.ciExpositor } });
        if (!exp) throw new BadRequestException(`El expositor con CI ${dto.ciExpositor} no existe`);
      }
      user.ciExpositor = dto.ciExpositor;
    }

    await this.usuarioRepo.save(user);
    return this.findOne(id);
  }

  async updateEstado(id: number, estado: UserStatus) {
    const user = await this.usuarioRepo.findOne({ where: { idUsuario: id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    user.estado = estado;
    await this.usuarioRepo.save(user);
    return this.findOne(id);
  }

  async updateRol(id: number, rol: UserRole) {
    const user = await this.usuarioRepo.findOne({ where: { idUsuario: id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    user.rol = rol;
    await this.usuarioRepo.save(user);
    return this.findOne(id);
  }

  async convertirEnExpositor(id: number, dto: { ciExpositor: string; nombre: string; paterno?: string; materno?: string; telefono?: string }) {
    const user = await this.usuarioRepo.findOne({ where: { idUsuario: id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    let exp = await this.expositorRepo.findOne({ where: { ciExpositor: dto.ciExpositor } });
    if (!exp) {
      exp = this.expositorRepo.create({
        ciExpositor: dto.ciExpositor,
        nombre: dto.nombre,
        paterno: dto.paterno || '',
        materno: dto.materno || '',
        correo: user.correo,
        telefono: dto.telefono || '',
      });
      await this.expositorRepo.save(exp);
    }

    user.ciExpositor = dto.ciExpositor;
    await this.usuarioRepo.save(user);
    return this.findOne(id);
  }

  async linkExpositor(id: number, ciExpositor: string | null) {
    const user = await this.usuarioRepo.findOne({ where: { idUsuario: id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

    if (ciExpositor) {
      const exp = await this.expositorRepo.findOne({ where: { ciExpositor } });
      if (!exp) throw new BadRequestException(`El expositor con CI ${ciExpositor} no existe`);
    }

    user.ciExpositor = ciExpositor;
    await this.usuarioRepo.save(user);
    return this.findOne(id);
  }

  async delete(id: number) {
    const user = await this.usuarioRepo.findOne({ where: { idUsuario: id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    await this.usuarioRepo.delete(id);
    return { message: `Usuario con ID ${id} eliminado exitosamente` };
  }

  async getMe(idUsuario: number) {
    const user = await this.usuarioRepo.findOne({
      where: { idUsuario },
      relations: { expositor: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.sanitize(user);
  }

  async getParticipaciones(idUsuario: number) {
    const user = await this.usuarioRepo.findOne({
      where: { idUsuario },
      relations: { expositor: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (!user.ciExpositor) {
      return { data: [] };
    }

    const conformans = await this.conformanRepo.find({
      where: { ciExpositor: user.ciExpositor },
      relations: { stand: { feria: { ubicacion: true } }, expositor: true },
    });

    const participaciones = [];

    for (const c of conformans) {
      const { idFeria, nroStand } = c;

      // Obtener productos ofrecidos en ese stand y feria
      const ofertas = await this.ofreceRepo.find({
        where: { idFeria, nroStand },
        relations: { producto: true },
      });

      // Exposiciones en ese stand y feria
      const exposiciones = await this.exposicionRepo.find({
        where: { idFeria, nroStand },
      });

      // Organizadores de la feria
      const organizadores = await this.organizaRepo.find({
        where: { idFeria },
        relations: { institucion: true },
      });

      // Patrocinadores de la feria
      const patrocinadores = await this.patrocinaRepo.find({
        where: { idFeria },
        relations: { institucion: true },
      });

      participaciones.push({
        feria: c.stand?.feria
          ? {
              id: c.stand.feria.idFeria,
              nombre: c.stand.feria.nombre,
              descripcion: c.stand.feria.descripcion,
              fechaInicio: c.stand.feria.fechaIni,
              fechaFin: c.stand.feria.fechaFin,
              horaInicio: c.stand.feria.horaInicio,
              horaFin: c.stand.feria.horaFin,
              estado: c.stand.feria.estado,
              tipo: c.stand.feria.tipo,
            }
          : null,
        stand: c.stand
          ? {
              numero: c.stand.nroStand,
              ubicacionInterna: c.stand.ubicacionInterna,
              ancho: c.stand.ancho,
              largo: c.stand.largo,
              estado: c.stand.estado,
            }
          : null,
        cargo: c.cargo,
        ubicacion: c.stand?.feria?.ubicacion || null,
        productos: ofertas.map((o) => ({
          id: o.producto?.idProducto,
          nombre: o.producto?.nombreProd,
          precio: o.producto?.precio,
          categoria: o.producto?.categoria,
          descripcion: o.producto?.descripcionProd,
          unidadMedida: o.unidadMedida,
          stock: o.stock,
        })),
        exposiciones: exposiciones.map((e) => ({
          id: e.idExposicion,
          titulo: e.tituloExposicion,
          descripcion: e.descripcion,
        })),
        organizadores: organizadores.map((org) => ({
          nit: org.nit,
          razonSocial: org.institucion?.razonSocial,
          rol: org.rol,
          correo: org.institucion?.correo,
          telefono: org.institucion?.telefono,
        })),
        patrocinadores: patrocinadores.map((p) => ({
          nit: p.nit,
          razonSocial: p.institucion?.razonSocial,
          tipoApoyo: p.tipoApoyo,
          cantidad: p.cantidad,
          detalles: p.detalles,
        })),
      });
    }

    return { data: participaciones };
  }

  private sanitize(usuario: Usuario) {
    return {
      idUsuario: usuario.idUsuario,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      ciExpositor: usuario.ciExpositor,
      esExpositor: !!usuario.ciExpositor,
      fechaCreacion: usuario.fechaCreacion,
      fechaActualizacion: usuario.fechaActualizacion,
      expositor: usuario.expositor
        ? {
            ci: usuario.expositor.ciExpositor,
            nombre: usuario.expositor.nombre,
            paterno: usuario.expositor.paterno,
            materno: usuario.expositor.materno,
            correo: usuario.expositor.correo,
            telefono: usuario.expositor.telefono,
          }
        : null,
    };
  }
}
