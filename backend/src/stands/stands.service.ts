import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stand } from './stand.entity';
import { Feria } from '../ferias/feria.entity';
import { CreateStandDto, UpdateStandDto } from './dto/stand.dto';

@Injectable()
export class StandsService {
  constructor(
    @InjectRepository(Stand)
    private readonly standRepo: Repository<Stand>,
    @InjectRepository(Feria)
    private readonly feriaRepo: Repository<Feria>,
  ) {}

  async findAllByFeria(idFeria: number) {
    const feria = await this.feriaRepo.findOne({ where: { idFeria } });
    if (!feria) throw new NotFoundException(`Feria con ID ${idFeria} no encontrada`);

    const stands = await this.standRepo.find({
      where: { idFeria },
      relations: {
        conforman: { expositor: true },
        exposiciones: true,
        ofrece: { producto: true },
      },
      order: { nroStand: 'ASC' },
    });

    return stands.map((s) => {
      const tieneProductos = (s.ofrece?.length || 0) > 0;
      const tieneExposicion = (s.exposiciones?.length || 0) > 0;
      let tipoStand = 'DISPONIBLE';
      if (tieneProductos && tieneExposicion) {
        tipoStand = 'MIXTO';
      } else if (tieneProductos) {
        tipoStand = 'SOLO_VENTA';
      } else if (tieneExposicion) {
        tipoStand = 'SOLO_EXPOSICION';
      }

      const expositores = s.conforman?.map((c) => ({
        ci: c.ciExpositor,
        nombre: c.expositor ? `${c.expositor.nombre} ${c.expositor.paterno || ''}`.trim() : c.ciExpositor,
        cargo: c.cargo,
        telefono: c.expositor?.telefono,
        correo: c.expositor?.correo,
        esEncargado: c.cargo?.toLowerCase().includes('encargado') || c.cargo?.toLowerCase().includes('responsable'),
      })) || [];

      const encargado = expositores.find((e) => e.esEncargado) || expositores[0] || null;

      const productos = s.ofrece?.map((o) => ({
        id: o.producto?.idProducto,
        nombre: o.producto?.nombreProd,
        precio: Number(o.producto?.precio),
        categoria: o.producto?.categoria,
        descripcion: o.producto?.descripcionProd,
        stock: o.stock,
        unidadMedida: o.unidadMedida,
      })) || [];

      const exposiciones = s.exposiciones?.map((e) => ({
        id: e.idExposicion,
        titulo: e.tituloExposicion,
        descripcion: e.descripcion,
      })) || [];

      return {
        nroStand: s.nroStand,
        idFeria: s.idFeria,
        ancho: Number(s.ancho),
        largo: Number(s.largo),
        ubicacionInterna: s.ubicacionInterna,
        estado: s.estado,
        tipoStand,
        encargado,
        expositores,
        productos,
        exposiciones,
      };
    });
  }

  async findOne(idFeria: number, nroStand: number) {
    const stand = await this.standRepo.findOne({
      where: { idFeria, nroStand },
      relations: { feria: true, conforman: { expositor: true }, exposiciones: true, ofrece: { producto: true } },
    });

    if (!stand) {
      throw new NotFoundException(`Stand #${nroStand} en feria ${idFeria} no encontrado`);
    }

    return {
      nroStand: stand.nroStand,
      idFeria: stand.idFeria,
      ancho: stand.ancho,
      largo: stand.largo,
      ubicacionInterna: stand.ubicacionInterna,
      estado: stand.estado,
      feria: stand.feria ? { id: stand.feria.idFeria, nombre: stand.feria.nombre } : null,
      expositores: stand.conforman?.map((c) => ({
        ci: c.ciExpositor,
        nombre: c.expositor ? `${c.expositor.nombre} ${c.expositor.paterno}` : '',
        cargo: c.cargo,
      })) || [],
      productos: stand.ofrece?.map((o) => ({
        id: o.producto?.idProducto,
        nombre: o.producto?.nombreProd,
        precio: o.producto?.precio,
        stock: o.stock,
        unidadMedida: o.unidadMedida,
      })) || [],
      exposiciones: stand.exposiciones?.map((e) => ({
        id: e.idExposicion,
        titulo: e.tituloExposicion,
        descripcion: e.descripcion,
      })) || [],
    };
  }

  async create(idFeria: number, dto: CreateStandDto) {
    const feria = await this.feriaRepo.findOne({ where: { idFeria } });
    if (!feria) throw new NotFoundException(`Feria con ID ${idFeria} no encontrada`);

    let nroStand = dto.nroStand;
    if (nroStand) {
      const exists = await this.standRepo.findOne({ where: { idFeria, nroStand } });
      if (exists) {
        throw new ConflictException(`El stand #${nroStand} ya existe en esta feria`);
      }
    } else {
      const maxStand = await this.standRepo
        .createQueryBuilder('s')
        .where('s.idFeria = :idFeria', { idFeria })
        .select('MAX(s.nroStand)', 'max')
        .getRawOne();
      nroStand = (maxStand?.max || 0) + 1;
    }

    const stand = this.standRepo.create({
      idFeria,
      nroStand,
      ancho: dto.ancho || 3.0,
      largo: dto.largo || 2.0,
      ubicacionInterna: dto.ubicacionInterna || `Stand #${nroStand}`,
      estado: dto.estado || 'DISPONIBLE',
    });

    await this.standRepo.save(stand);
    return this.findOne(idFeria, nroStand);
  }

  async update(idFeria: number, nroStand: number, dto: UpdateStandDto) {
    const stand = await this.standRepo.findOne({ where: { idFeria, nroStand } });
    if (!stand) throw new NotFoundException(`Stand #${nroStand} en feria ${idFeria} no encontrado`);

    if (dto.ancho !== undefined) stand.ancho = dto.ancho;
    if (dto.largo !== undefined) stand.largo = dto.largo;
    if (dto.ubicacionInterna !== undefined) stand.ubicacionInterna = dto.ubicacionInterna;
    if (dto.estado !== undefined) stand.estado = dto.estado;

    await this.standRepo.save(stand);
    return this.findOne(idFeria, nroStand);
  }

  async delete(idFeria: number, nroStand: number) {
    const stand = await this.standRepo.findOne({ where: { idFeria, nroStand } });
    if (!stand) throw new NotFoundException(`Stand #${nroStand} en feria ${idFeria} no encontrado`);
    await this.standRepo.delete({ idFeria, nroStand });
    return { message: `Stand #${nroStand} de la feria ${idFeria} eliminado exitosamente` };
  }
}
