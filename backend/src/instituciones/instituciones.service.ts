import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institucion } from './institucion.entity';
import { CreateInstitucionDto, UpdateInstitucionDto } from './dto/institucion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class InstitucionesService {
  constructor(
    @InjectRepository(Institucion)
    private readonly repo: Repository<Institucion>,
  ) {}

  async findAll(pagination?: PaginationDto, search?: string) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('i').orderBy('i.razonSocial', 'ASC');

    if (search) {
      qb.where('i.nit LIKE :search OR i.razonSocial LIKE :search OR i.correo LIKE :search', {
        search: `%${search}%`,
      });
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(nit: string) {
    const item = await this.repo.findOne({
      where: { nit },
      relations: { organiza: { feria: true }, patrocina: { feria: true } },
    });

    if (!item) throw new NotFoundException(`Institución con NIT ${nit} no encontrada`);

    return {
      nit: item.nit,
      razonSocial: item.razonSocial,
      correo: item.correo,
      telefono: item.telefono,
      feriasOrganizadas: item.organiza?.map((o) => ({
        idFeria: o.idFeria,
        feriaNombre: o.feria?.nombre,
        rol: o.rol,
      })) || [],
      feriasPatrocinadas: item.patrocina?.map((p) => ({
        idFeria: p.idFeria,
        feriaNombre: p.feria?.nombre,
        tipoApoyo: p.tipoApoyo,
        cantidad: p.cantidad,
        detalles: p.detalles,
      })) || [],
    };
  }

  async create(dto: CreateInstitucionDto) {
    const existing = await this.repo.findOne({ where: { nit: dto.nit } });
    if (existing) {
      throw new ConflictException(`La institución con NIT ${dto.nit} ya existe`);
    }

    const item = this.repo.create({
      nit: dto.nit,
      razonSocial: dto.razonSocial,
      correo: dto.correo,
      telefono: dto.telefono,
    });

    const saved = await this.repo.save(item);
    return this.findOne(saved.nit);
  }

  async update(nit: string, dto: UpdateInstitucionDto) {
    const item = await this.repo.findOne({ where: { nit } });
    if (!item) throw new NotFoundException(`Institución con NIT ${nit} no encontrada`);

    if (dto.razonSocial !== undefined) item.razonSocial = dto.razonSocial;
    if (dto.correo !== undefined) item.correo = dto.correo;
    if (dto.telefono !== undefined) item.telefono = dto.telefono;

    await this.repo.save(item);
    return this.findOne(nit);
  }

  async delete(nit: string) {
    const item = await this.repo.findOne({ where: { nit } });
    if (!item) throw new NotFoundException(`Institución con NIT ${nit} no encontrada`);
    await this.repo.delete(nit);
    return { message: `Institución con NIT ${nit} eliminada exitosamente` };
  }
}
