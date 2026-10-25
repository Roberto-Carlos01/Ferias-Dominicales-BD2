import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conforman } from './conforman.entity';
import { Feria } from '../ferias/feria.entity';
import { Expositor } from '../expositores/expositor.entity';
import { Stand } from '../stands/stand.entity';
import { CreateParticipanteDto, UpdateParticipanteDto } from './dto/participante.dto';

@Injectable()
export class ParticipantesService {
  constructor(
    @InjectRepository(Conforman)
    private readonly conformanRepo: Repository<Conforman>,
    @InjectRepository(Feria)
    private readonly feriaRepo: Repository<Feria>,
    @InjectRepository(Expositor)
    private readonly expositorRepo: Repository<Expositor>,
    @InjectRepository(Stand)
    private readonly standRepo: Repository<Stand>,
  ) {}

  async findAllByFeria(idFeria: number) {
    const feria = await this.feriaRepo.findOne({ where: { idFeria } });
    if (!feria) throw new NotFoundException(`Feria con ID ${idFeria} no encontrada`);

    const items = await this.conformanRepo.find({
      where: { idFeria },
      relations: { expositor: true, stand: true },
    });

    return {
      data: items.map((c) => ({
        expositor: c.expositor
          ? {
              ci: c.expositor.ciExpositor,
              nombre: c.expositor.nombre,
              paterno: c.expositor.paterno,
              materno: c.expositor.materno,
              correo: c.expositor.correo,
              telefono: c.expositor.telefono,
            }
          : null,
        stand: c.stand
          ? {
              numero: c.stand.nroStand,
              ubicacionInterna: c.stand.ubicacionInterna,
              estado: c.stand.estado,
            }
          : null,
        cargo: c.cargo,
      })),
    };
  }

  async create(idFeria: number, dto: CreateParticipanteDto) {
    const feria = await this.feriaRepo.findOne({ where: { idFeria } });
    if (!feria) throw new NotFoundException(`Feria con ID ${idFeria} no encontrada`);

    const expositor = await this.expositorRepo.findOne({ where: { ciExpositor: dto.ciExpositor } });
    if (!expositor) throw new BadRequestException(`Expositor con CI ${dto.ciExpositor} no existe`);

    const stand = await this.standRepo.findOne({
      where: { idFeria, nroStand: dto.nroStand },
    });
    if (!stand) {
      throw new BadRequestException(`El Stand #${dto.nroStand} no pertenece a la feria ${idFeria}`);
    }

    const existing = await this.conformanRepo.findOne({
      where: { idFeria, ciExpositor: dto.ciExpositor, nroStand: dto.nroStand },
    });
    if (existing) {
      throw new ConflictException('El expositor ya tiene asignado este stand en la feria');
    }

    const item = this.conformanRepo.create({
      idFeria,
      ciExpositor: dto.ciExpositor,
      nroStand: dto.nroStand,
      cargo: dto.cargo || 'Participante',
    });

    await this.conformanRepo.save(item);

    return {
      message: 'Participante registrado exitosamente en la feria',
      participante: {
        idFeria,
        ciExpositor: dto.ciExpositor,
        nroStand: dto.nroStand,
        cargo: item.cargo,
      },
    };
  }

  async update(idFeria: number, ciExpositor: string, dto: UpdateParticipanteDto) {
    const item = await this.conformanRepo.findOne({
      where: { idFeria, ciExpositor },
    });
    if (!item) {
      throw new NotFoundException(`Participación no encontrada para CI ${ciExpositor} en la feria ${idFeria}`);
    }

    if (dto.nroStand && dto.nroStand !== item.nroStand) {
      const stand = await this.standRepo.findOne({
        where: { idFeria, nroStand: dto.nroStand },
      });
      if (!stand) {
        throw new BadRequestException(`El Stand #${dto.nroStand} no pertenece a la feria ${idFeria}`);
      }
      // Recrear clave primaria si cambia nroStand
      await this.conformanRepo.delete({ idFeria, ciExpositor, nroStand: item.nroStand });
      item.nroStand = dto.nroStand;
    }

    if (dto.cargo !== undefined) item.cargo = dto.cargo;

    await this.conformanRepo.save(item);
    return { message: 'Participación actualizada exitosamente' };
  }

  async delete(idFeria: number, ciExpositor: string) {
    const item = await this.conformanRepo.findOne({
      where: { idFeria, ciExpositor },
    });
    if (!item) {
      throw new NotFoundException(`Participación no encontrada para CI ${ciExpositor} en la feria ${idFeria}`);
    }

    await this.conformanRepo.delete({ idFeria, ciExpositor, nroStand: item.nroStand });
    return { message: 'Participación eliminada exitosamente' };
  }
}
