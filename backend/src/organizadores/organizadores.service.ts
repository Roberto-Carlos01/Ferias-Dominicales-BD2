import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organiza } from './organiza.entity';
import { Feria } from '../ferias/feria.entity';
import { Institucion } from '../instituciones/institucion.entity';
import { CreateOrganizadorDto, UpdateOrganizadorDto } from './dto/organizador.dto';

@Injectable()
export class OrganizadoresService {
  constructor(
    @InjectRepository(Organiza)
    private readonly repo: Repository<Organiza>,
    @InjectRepository(Feria)
    private readonly feriaRepo: Repository<Feria>,
    @InjectRepository(Institucion)
    private readonly institucionRepo: Repository<Institucion>,
  ) {}

  async findAll(pagination?: { page?: number; limit?: number }, search?: string, idFeria?: number, rol?: string) {
    const page = Number(pagination?.page) || 1;
    const limit = Number(pagination?.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.feria', 'f')
      .leftJoinAndSelect('o.institucion', 'i')
      .orderBy('f.fechaIni', 'DESC');

    if (idFeria) {
      qb.andWhere('o.idFeria = :idFeria', { idFeria });
    }

    if (rol) {
      qb.andWhere('o.rol LIKE :rol', { rol: `%${rol}%` });
    }

    if (search) {
      qb.andWhere(
        '(f.nombre LIKE :search OR i.razonSocial LIKE :search OR i.nit LIKE :search OR o.rol LIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((o) => ({
        idFeria: o.idFeria,
        nit: o.nit,
        rol: o.rol,
        feria: o.feria
          ? {
              idFeria: o.feria.idFeria,
              nombre: o.feria.nombre,
              fechaIni: o.feria.fechaIni,
              fechaFin: o.feria.fechaFin,
              estado: o.feria.estado,
            }
          : null,
        institucion: o.institucion
          ? {
              nit: o.institucion.nit,
              razonSocial: o.institucion.razonSocial,
              correo: o.institucion.correo,
              telefono: o.institucion.telefono,
            }
          : null,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllByFeria(idFeria: number) {
    const feria = await this.feriaRepo.findOne({ where: { idFeria } });
    if (!feria) throw new NotFoundException(`Feria con ID ${idFeria} no encontrada`);

    const items = await this.repo.find({
      where: { idFeria },
      relations: { institucion: true },
    });

    return {
      data: items.map((o) => ({
        nit: o.nit,
        razonSocial: o.institucion?.razonSocial,
        correo: o.institucion?.correo,
        telefono: o.institucion?.telefono,
        rol: o.rol,
      })),
    };
  }

  async create(idFeria: number, dto: CreateOrganizadorDto) {
    const feria = await this.feriaRepo.findOne({ where: { idFeria } });
    if (!feria) throw new NotFoundException(`Feria con ID ${idFeria} no encontrada`);

    const inst = await this.institucionRepo.findOne({ where: { nit: dto.nit } });
    if (!inst) throw new BadRequestException(`Institución con NIT ${dto.nit} no existe`);

    const existing = await this.repo.findOne({ where: { idFeria, nit: dto.nit } });
    if (existing) {
      throw new ConflictException('Esta institución ya está registrada como organizadora de la feria');
    }

    const org = this.repo.create({
      idFeria,
      nit: dto.nit,
      rol: dto.rol || 'Organizador',
    });

    await this.repo.save(org);
    return {
      message: 'Organizador registrado exitosamente',
      data: {
        idFeria,
        nit: org.nit,
        rol: org.rol,
        razonSocial: inst.razonSocial,
      },
    };
  }

  async update(idFeria: number, nit: string, dto: UpdateOrganizadorDto) {
    const org = await this.repo.findOne({ where: { idFeria, nit } });
    if (!org) {
      throw new NotFoundException(`Organizador con NIT ${nit} en feria ${idFeria} no encontrado`);
    }

    if (dto.rol !== undefined) org.rol = dto.rol;

    await this.repo.save(org);
    return { message: 'Organizador actualizado exitosamente', data: org };
  }

  async delete(idFeria: number, nit: string) {
    const org = await this.repo.findOne({ where: { idFeria, nit } });
    if (!org) {
      throw new NotFoundException(`Organizador con NIT ${nit} en feria ${idFeria} no encontrado`);
    }

    await this.repo.delete({ idFeria, nit });
    return { message: 'Organizador retirado de la feria exitosamente' };
  }
}
