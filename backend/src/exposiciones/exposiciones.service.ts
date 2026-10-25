import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exposicion } from './exposicion.entity';
import { Stand } from '../stands/stand.entity';
import { CreateExposicionDto, UpdateExposicionDto } from './dto/exposicion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ExposicionesService {
  constructor(
    @InjectRepository(Exposicion)
    private readonly repo: Repository<Exposicion>,
    @InjectRepository(Stand)
    private readonly standRepo: Repository<Stand>,
  ) {}

  async findAll(pagination?: PaginationDto, search?: string, idFeria?: number) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.feria', 'f')
      .orderBy('e.idExposicion', 'ASC');

    if (search) {
      qb.where('(e.tituloExposicion LIKE :search OR e.descripcion LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (idFeria) {
      qb.andWhere('e.idFeria = :idFeria', { idFeria });
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((e) => ({
        idExposicion: e.idExposicion,
        tituloExposicion: e.tituloExposicion,
        descripcion: e.descripcion,
        idFeria: e.idFeria,
        feriaNombre: e.feria?.nombre,
        nroStand: e.nroStand,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { idExposicion: id },
      relations: { feria: true, stand: true },
    });

    if (!item) throw new NotFoundException(`Exposición con ID ${id} no encontrada`);

    return {
      idExposicion: item.idExposicion,
      tituloExposicion: item.tituloExposicion,
      descripcion: item.descripcion,
      idFeria: item.idFeria,
      feria: item.feria ? { id: item.feria.idFeria, nombre: item.feria.nombre } : null,
      nroStand: item.nroStand,
      stand: item.stand
        ? {
            nroStand: item.stand.nroStand,
            ubicacionInterna: item.stand.ubicacionInterna,
            estado: item.stand.estado,
          }
        : null,
    };
  }

  async create(dto: CreateExposicionDto) {
    // Validar que el stand exista en la feria
    const stand = await this.standRepo.findOne({
      where: { idFeria: dto.idFeria, nroStand: dto.nroStand },
    });
    if (!stand) {
      throw new BadRequestException(
        `El Stand #${dto.nroStand} no existe en la feria ${dto.idFeria}`,
      );
    }

    let idExposicion = dto.idExposicion;
    if (!idExposicion) {
      const maxItem = await this.repo
        .createQueryBuilder('e')
        .select('MAX(e.idExposicion)', 'max')
        .getRawOne();
      idExposicion = (maxItem?.max || 0) + 1;
    }

    const expo = this.repo.create({
      idExposicion,
      tituloExposicion: dto.tituloExposicion,
      descripcion: dto.descripcion,
      idFeria: dto.idFeria,
      nroStand: dto.nroStand,
    });

    const saved = await this.repo.save(expo);
    return this.findOne(saved.idExposicion);
  }

  async update(id: number, dto: UpdateExposicionDto) {
    const expo = await this.repo.findOne({ where: { idExposicion: id } });
    if (!expo) throw new NotFoundException(`Exposición con ID ${id} no encontrada`);

    const idFeria = dto.idFeria ?? expo.idFeria;
    const nroStand = dto.nroStand ?? expo.nroStand;

    if (dto.idFeria !== undefined || dto.nroStand !== undefined) {
      const stand = await this.standRepo.findOne({ where: { idFeria, nroStand } });
      if (!stand) {
        throw new BadRequestException(`El Stand #${nroStand} no existe en la feria ${idFeria}`);
      }
      expo.idFeria = idFeria;
      expo.nroStand = nroStand;
    }

    if (dto.tituloExposicion !== undefined) expo.tituloExposicion = dto.tituloExposicion;
    if (dto.descripcion !== undefined) expo.descripcion = dto.descripcion;

    await this.repo.save(expo);
    return this.findOne(id);
  }

  async delete(id: number) {
    const expo = await this.repo.findOne({ where: { idExposicion: id } });
    if (!expo) throw new NotFoundException(`Exposición con ID ${id} no encontrada`);
    await this.repo.delete(id);
    return { message: `Exposición con ID ${id} eliminada exitosamente` };
  }
}
