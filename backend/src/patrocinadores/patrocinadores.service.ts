import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patrocina } from './patrocina.entity';
import { Feria } from '../ferias/feria.entity';
import { Institucion } from '../instituciones/institucion.entity';
import { CreatePatrocinadorDto, UpdatePatrocinadorDto } from './dto/patrocinador.dto';

@Injectable()
export class PatrocinadoresService {
  constructor(
    @InjectRepository(Patrocina)
    private readonly repo: Repository<Patrocina>,
    @InjectRepository(Feria)
    private readonly feriaRepo: Repository<Feria>,
    @InjectRepository(Institucion)
    private readonly institucionRepo: Repository<Institucion>,
  ) {}

  async findAll(pagination?: { page?: number; limit?: number }, search?: string, idFeria?: number, tipoApoyo?: string) {
    const page = Number(pagination?.page) || 1;
    const limit = Number(pagination?.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.feria', 'f')
      .leftJoinAndSelect('p.institucion', 'i')
      .orderBy('f.fechaIni', 'DESC');

    if (idFeria) {
      qb.andWhere('p.idFeria = :idFeria', { idFeria });
    }

    if (tipoApoyo) {
      qb.andWhere('p.tipoApoyo = :tipoApoyo', { tipoApoyo });
    }

    if (search) {
      qb.andWhere(
        '(f.nombre LIKE :search OR i.razonSocial LIKE :search OR i.nit LIKE :search OR p.detalles LIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((p) => ({
        idFeria: p.idFeria,
        nit: p.nit,
        tipoApoyo: p.tipoApoyo,
        cantidad: Number(p.cantidad),
        detalles: p.detalles,
        feria: p.feria
          ? {
              idFeria: p.feria.idFeria,
              nombre: p.feria.nombre,
              fechaIni: p.feria.fechaIni,
              fechaFin: p.feria.fechaFin,
              estado: p.feria.estado,
            }
          : null,
        institucion: p.institucion
          ? {
              nit: p.institucion.nit,
              razonSocial: p.institucion.razonSocial,
              correo: p.institucion.correo,
              telefono: p.institucion.telefono,
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
      data: items.map((p) => ({
        nit: p.nit,
        razonSocial: p.institucion?.razonSocial,
        correo: p.institucion?.correo,
        telefono: p.institucion?.telefono,
        tipoApoyo: p.tipoApoyo,
        cantidad: Number(p.cantidad),
        detalles: p.detalles,
      })),
    };
  }

  async create(idFeria: number, dto: CreatePatrocinadorDto) {
    const feria = await this.feriaRepo.findOne({ where: { idFeria } });
    if (!feria) throw new NotFoundException(`Feria con ID ${idFeria} no encontrada`);

    const inst = await this.institucionRepo.findOne({ where: { nit: dto.nit } });
    if (!inst) throw new BadRequestException(`Institución con NIT ${dto.nit} no existe`);

    const existing = await this.repo.findOne({ where: { idFeria, nit: dto.nit } });
    if (existing) {
      throw new ConflictException('Esta institución ya está registrada como patrocinadora de la feria');
    }

    const item = this.repo.create({
      idFeria,
      nit: dto.nit,
      tipoApoyo: dto.tipoApoyo || 'ECONOMICO',
      cantidad: dto.cantidad || 0,
      detalles: dto.detalles,
    });

    await this.repo.save(item);
    return {
      message: 'Patrocinador registrado exitosamente',
      data: {
        idFeria,
        nit: item.nit,
        razonSocial: inst.razonSocial,
        tipoApoyo: item.tipoApoyo,
        cantidad: Number(item.cantidad),
        detalles: item.detalles,
      },
    };
  }

  async update(idFeria: number, nit: string, dto: UpdatePatrocinadorDto) {
    const item = await this.repo.findOne({ where: { idFeria, nit } });
    if (!item) {
      throw new NotFoundException(`Patrocinador con NIT ${nit} en feria ${idFeria} no encontrado`);
    }

    if (dto.tipoApoyo !== undefined) item.tipoApoyo = dto.tipoApoyo;
    if (dto.cantidad !== undefined) item.cantidad = dto.cantidad;
    if (dto.detalles !== undefined) item.detalles = dto.detalles;

    await this.repo.save(item);
    return { message: 'Patrocinio actualizado exitosamente', data: item };
  }

  async delete(idFeria: number, nit: string) {
    const item = await this.repo.findOne({ where: { idFeria, nit } });
    if (!item) {
      throw new NotFoundException(`Patrocinador con NIT ${nit} en feria ${idFeria} no encontrado`);
    }

    await this.repo.delete({ idFeria, nit });
    return { message: 'Patrocinador retirado de la feria exitosamente' };
  }
}
