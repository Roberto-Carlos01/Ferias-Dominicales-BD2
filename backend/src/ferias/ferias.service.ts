import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feria } from './feria.entity';
import { CreateFeriaDto, UpdateFeriaDto, QueryFeriaDto } from './dto/feria.dto';

@Injectable()
export class FeriasService {
  constructor(
    @InjectRepository(Feria)
    private readonly feriaRepo: Repository<Feria>,
  ) {}

  async findAll(query: QueryFeriaDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.feriaRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.ubicacion', 'u')
      .orderBy('f.fechaIni', 'DESC');

    if (query.search) {
      qb.andWhere('(f.nombre LIKE :search OR f.descripcion LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.estado) {
      qb.andWhere('f.estado = :estado', { estado: query.estado });
    }

    if (query.tipo) {
      qb.andWhere('f.tipo = :tipo', { tipo: query.tipo });
    }

    if (query.fechaDesde) {
      qb.andWhere('f.fechaIni >= :desde', { desde: query.fechaDesde });
    }

    if (query.fechaHasta) {
      qb.andWhere('f.fechaFin <= :hasta', { hasta: query.fechaHasta });
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((f) => ({
        idFeria: f.idFeria,
        nombre: f.nombre,
        descripcion: f.descripcion,
        fechaInicio: f.fechaIni,
        fechaFin: f.fechaFin,
        horaInicio: f.horaInicio,
        horaFin: f.horaFin,
        estado: f.estado,
        tipo: f.tipo,
        ubicacion: f.ubicacion
          ? {
              id: f.ubicacion.idUbicacion,
              nombre: f.ubicacion.nombre,
              ciudad: f.ubicacion.ciudad,
              zona: f.ubicacion.zona,
              capacidad: f.ubicacion.capacidad,
              referencia: f.ubicacion.referencia,
            }
          : null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const feria = await this.feriaRepo.findOne({
      where: { idFeria: id },
      relations: { ubicacion: true },
    });

    if (!feria) {
      throw new NotFoundException(`Feria con ID ${id} no encontrada`);
    }

    return {
      idFeria: feria.idFeria,
      nombre: feria.nombre,
      descripcion: feria.descripcion,
      fechaInicio: feria.fechaIni,
      fechaFin: feria.fechaFin,
      horaInicio: feria.horaInicio,
      horaFin: feria.horaFin,
      estado: feria.estado,
      tipo: feria.tipo,
      idUbicacion: feria.idUbicacion,
      ubicacion: feria.ubicacion
        ? {
            id: feria.ubicacion.idUbicacion,
            nombre: feria.ubicacion.nombre,
            ciudad: feria.ubicacion.ciudad,
            zona: feria.ubicacion.zona,
            capacidad: feria.ubicacion.capacidad,
            referencia: feria.ubicacion.referencia,
          }
        : null,
    };
  }

  async create(dto: CreateFeriaDto) {
    let idFeria = dto.idFeria;
    if (!idFeria) {
      const maxItem = await this.feriaRepo
        .createQueryBuilder('f')
        .select('MAX(f.idFeria)', 'max')
        .getRawOne();
      idFeria = (maxItem?.max || 0) + 1;
    }

    const feria = this.feriaRepo.create({
      idFeria,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      fechaIni: dto.fechaIni,
      fechaFin: dto.fechaFin,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      estado: dto.estado || 'PLANIFICADA',
      tipo: dto.tipo || 'GENERAL',
      idUbicacion: dto.idUbicacion,
    });

    const saved = await this.feriaRepo.save(feria);
    return this.findOne(saved.idFeria);
  }

  async update(id: number, dto: UpdateFeriaDto) {
    const feria = await this.feriaRepo.findOne({ where: { idFeria: id } });
    if (!feria) throw new NotFoundException(`Feria con ID ${id} no encontrada`);

    if (dto.nombre !== undefined) feria.nombre = dto.nombre;
    if (dto.descripcion !== undefined) feria.descripcion = dto.descripcion;
    if (dto.fechaIni !== undefined) feria.fechaIni = dto.fechaIni;
    if (dto.fechaFin !== undefined) feria.fechaFin = dto.fechaFin;
    if (dto.horaInicio !== undefined) feria.horaInicio = dto.horaInicio;
    if (dto.horaFin !== undefined) feria.horaFin = dto.horaFin;
    if (dto.estado !== undefined) feria.estado = dto.estado;
    if (dto.tipo !== undefined) feria.tipo = dto.tipo;
    if (dto.idUbicacion !== undefined) feria.idUbicacion = dto.idUbicacion;

    await this.feriaRepo.save(feria);
    return this.findOne(id);
  }

  async delete(id: number) {
    const feria = await this.feriaRepo.findOne({ where: { idFeria: id } });
    if (!feria) throw new NotFoundException(`Feria con ID ${id} no encontrada`);
    await this.feriaRepo.delete(id);
    return { message: `Feria con ID ${id} eliminada exitosamente` };
  }
}
