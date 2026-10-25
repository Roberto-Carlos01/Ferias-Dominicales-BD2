import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Ubicacion } from './ubicacion.entity';
import { CreateUbicacionDto, UpdateUbicacionDto } from './dto/ubicacion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UbicacionesService {
  constructor(
    @InjectRepository(Ubicacion)
    private readonly repo: Repository<Ubicacion>,
  ) {}

  async findAll(pagination?: PaginationDto, search?: string) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = search
      ? [{ nombre: Like(`%${search}%`) }, { zona: Like(`%${search}%`) }, { ciudad: Like(`%${search}%`) }]
      : {};

    const [data, total] = await this.repo.findAndCount({
      where,
      skip,
      take: limit,
      order: { idUbicacion: 'ASC' },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { idUbicacion: id },
      relations: { ferias: true },
    });
    if (!item) throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    return item;
  }

  async create(dto: CreateUbicacionDto) {
    let idUbicacion = dto.idUbicacion;
    if (!idUbicacion) {
      const maxItem = await this.repo
        .createQueryBuilder('u')
        .select('MAX(u.idUbicacion)', 'max')
        .getRawOne();
      idUbicacion = (maxItem?.max || 0) + 1;
    }

    const item = this.repo.create({
      idUbicacion,
      nombre: dto.nombre,
      ciudad: dto.ciudad,
      zona: dto.zona,
      capacidad: dto.capacidad,
      referencia: dto.referencia,
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateUbicacionDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async delete(id: number) {
    const item = await this.findOne(id);
    await this.repo.delete(id);
    return { message: `Ubicación con ID ${id} eliminada` };
  }
}
