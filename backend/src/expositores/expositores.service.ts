import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expositor } from './expositor.entity';
import { CreateExpositorDto, UpdateExpositorDto } from './dto/expositor.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ExpositoresService {
  constructor(
    @InjectRepository(Expositor)
    private readonly expositorRepo: Repository<Expositor>,
  ) {}

  async findAll(pagination?: PaginationDto, search?: string, multiples?: boolean, idFeria?: number) {
    const page = Number(pagination?.page) || 1;
    const limit = Number(pagination?.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.expositorRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.conforman', 'c')
      .leftJoinAndSelect('c.stand', 's')
      .leftJoinAndSelect('s.feria', 'f')
      .orderBy('e.paterno', 'ASC');

    if (search) {
      qb.where(
        '(e.ciExpositor LIKE :search OR e.nombre LIKE :search OR e.paterno LIKE :search OR e.materno LIKE :search OR e.correo LIKE :search OR f.nombre LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (idFeria) {
      qb.andWhere('c.idFeria = :idFeria', { idFeria });
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    const mapped = items.map((e) => {
      const participaciones = (e.conforman || []).map((c) => ({
        idFeria: c.idFeria,
        feriaNombre: c.stand?.feria?.nombre || `Feria #${c.idFeria}`,
        fechaIni: c.stand?.feria?.fechaIni,
        fechaFin: c.stand?.feria?.fechaFin,
        nroStand: c.nroStand,
        cargo: c.cargo,
        ubicacionInterna: c.stand?.ubicacionInterna,
      }));

      return {
        ci: e.ciExpositor,
        nombre: e.nombre,
        paterno: e.paterno,
        materno: e.materno,
        correo: e.correo,
        telefono: e.telefono,
        totalParticipaciones: participaciones.length,
        participoMasDeUnaVez: participaciones.length > 1,
        participaciones,
      };
    });

    return {
      data: multiples ? mapped.filter((m) => m.participoMasDeUnaVez) : mapped,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(ci: string) {
    const e = await this.expositorRepo.findOne({
      where: { ciExpositor: ci },
      relations: { conforman: { stand: { feria: true } } },
    });

    if (!e) throw new NotFoundException(`Expositor con CI ${ci} no encontrado`);

    return {
      ci: e.ciExpositor,
      nombre: e.nombre,
      paterno: e.paterno,
      materno: e.materno,
      correo: e.correo,
      telefono: e.telefono,
      participaciones: e.conforman?.map((c) => ({
        feriaId: c.idFeria,
        feriaNombre: c.stand?.feria?.nombre,
        nroStand: c.nroStand,
        cargo: c.cargo,
      })) || [],
    };
  }

  async create(dto: CreateExpositorDto) {
    const existing = await this.expositorRepo.findOne({ where: { ciExpositor: dto.ciExpositor } });
    if (existing) {
      throw new ConflictException(`El expositor con CI ${dto.ciExpositor} ya existe`);
    }

    const exp = this.expositorRepo.create({
      ciExpositor: dto.ciExpositor,
      nombre: dto.nombre,
      paterno: dto.paterno,
      materno: dto.materno,
      correo: dto.correo,
      telefono: dto.telefono,
    });

    const saved = await this.expositorRepo.save(exp);
    return this.findOne(saved.ciExpositor);
  }

  async update(ci: string, dto: UpdateExpositorDto) {
    const exp = await this.expositorRepo.findOne({ where: { ciExpositor: ci } });
    if (!exp) throw new NotFoundException(`Expositor con CI ${ci} no encontrado`);

    if (dto.nombre !== undefined) exp.nombre = dto.nombre;
    if (dto.paterno !== undefined) exp.paterno = dto.paterno;
    if (dto.materno !== undefined) exp.materno = dto.materno;
    if (dto.correo !== undefined) exp.correo = dto.correo;
    if (dto.telefono !== undefined) exp.telefono = dto.telefono;

    await this.expositorRepo.save(exp);
    return this.findOne(ci);
  }

  async delete(ci: string) {
    const exp = await this.expositorRepo.findOne({ where: { ciExpositor: ci } });
    if (!exp) throw new NotFoundException(`Expositor con CI ${ci} no encontrado`);
    await this.expositorRepo.delete({ ciExpositor: ci });
    return { message: `Expositor con CI ${ci} eliminado exitosamente` };
  }
}
