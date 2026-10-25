import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ofrece } from './ofrece.entity';
import { Stand } from '../stands/stand.entity';
import { Producto } from '../productos/producto.entity';
import { CreateOfertaDto, UpdateOfertaDto } from './dto/oferta.dto';

@Injectable()
export class OfertasService {
  constructor(
    @InjectRepository(Ofrece)
    private readonly repo: Repository<Ofrece>,
    @InjectRepository(Stand)
    private readonly standRepo: Repository<Stand>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  async findAllByStand(idFeria: number, nroStand: number) {
    const stand = await this.standRepo.findOne({ where: { idFeria, nroStand } });
    if (!stand) throw new NotFoundException(`Stand #${nroStand} en feria ${idFeria} no encontrado`);

    const items = await this.repo.find({
      where: { idFeria, nroStand },
      relations: { producto: true },
    });

    return {
      data: items.map((o) => ({
        idProducto: o.idProducto,
        nombreProd: o.producto?.nombreProd,
        precio: Number(o.producto?.precio),
        categoria: o.producto?.categoria,
        descripcionProd: o.producto?.descripcionProd,
        unidadMedida: o.unidadMedida,
        stock: o.stock,
      })),
    };
  }

  async create(idFeria: number, nroStand: number, dto: CreateOfertaDto) {
    const stand = await this.standRepo.findOne({ where: { idFeria, nroStand } });
    if (!stand) throw new NotFoundException(`Stand #${nroStand} en feria ${idFeria} no encontrado`);

    const prod = await this.productoRepo.findOne({ where: { idProducto: dto.idProducto } });
    if (!prod) throw new BadRequestException(`Producto con ID ${dto.idProducto} no existe`);

    const existing = await this.repo.findOne({
      where: { idFeria, nroStand, idProducto: dto.idProducto },
    });
    if (existing) {
      throw new ConflictException('Este producto ya está registrado en este stand');
    }

    const oferta = this.repo.create({
      idFeria,
      nroStand,
      idProducto: dto.idProducto,
      unidadMedida: dto.unidadMedida || 'unidad',
      stock: dto.stock,
    });

    await this.repo.save(oferta);
    return {
      message: 'Producto asignado al stand exitosamente',
      data: {
        idFeria,
        nroStand,
        idProducto: dto.idProducto,
        unidadMedida: oferta.unidadMedida,
        stock: oferta.stock,
      },
    };
  }

  async update(idFeria: number, nroStand: number, idProducto: number, dto: UpdateOfertaDto) {
    const oferta = await this.repo.findOne({ where: { idFeria, nroStand, idProducto } });
    if (!oferta) {
      throw new NotFoundException(`Oferta del producto ${idProducto} en stand #${nroStand} no encontrada`);
    }

    if (dto.unidadMedida !== undefined) oferta.unidadMedida = dto.unidadMedida;
    if (dto.stock !== undefined) oferta.stock = dto.stock;

    await this.repo.save(oferta);
    return { message: 'Oferta actualizada exitosamente', data: oferta };
  }

  async delete(idFeria: number, nroStand: number, idProducto: number) {
    const oferta = await this.repo.findOne({ where: { idFeria, nroStand, idProducto } });
    if (!oferta) {
      throw new NotFoundException(`Oferta del producto ${idProducto} en stand #${nroStand} no encontrada`);
    }

    await this.repo.delete({ idFeria, nroStand, idProducto });
    return { message: 'Producto retirado del stand exitosamente' };
  }
}
