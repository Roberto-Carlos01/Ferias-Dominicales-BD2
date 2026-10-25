import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto, UpdateProductoDto } from './dto/producto.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
  ) {}

  async findAll(pagination?: PaginationDto, search?: string, categoria?: string, idFeria?: number) {
    const page = Number(pagination?.page) || 1;
    const limit = Number(pagination?.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.ofrece', 'o')
      .leftJoinAndSelect('o.stand', 's')
      .leftJoinAndSelect('s.feria', 'f')
      .orderBy('p.nombreProd', 'ASC');

    if (search) {
      qb.where('(p.nombreProd LIKE :search OR p.descripcionProd LIKE :search OR p.categoria LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (categoria) {
      qb.andWhere('p.categoria = :categoria', { categoria });
    }

    if (idFeria) {
      qb.andWhere('o.idFeria = :idFeria', { idFeria });
    }

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((p) => ({
        idProducto: p.idProducto,
        nombreProd: p.nombreProd,
        precio: Number(p.precio),
        categoria: p.categoria,
        descripcionProd: p.descripcionProd,
        standsCount: p.ofrece?.length || 0,
        ofertas: p.ofrece?.map((o) => ({
          idFeria: o.idFeria,
          nroStand: o.nroStand,
          feriaNombre: o.stand?.feria?.nombre || `Feria #${o.idFeria}`,
          stock: o.stock,
          unidadMedida: o.unidadMedida,
        })) || [],
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { idProducto: id },
      relations: { ofrece: { stand: { feria: true } } },
    });

    if (!item) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    return {
      idProducto: item.idProducto,
      nombreProd: item.nombreProd,
      precio: Number(item.precio),
      categoria: item.categoria,
      descripcionProd: item.descripcionProd,
      ofertas: item.ofrece?.map((o) => ({
        idFeria: o.idFeria,
        feriaNombre: o.stand?.feria?.nombre,
        nroStand: o.nroStand,
        unidadMedida: o.unidadMedida,
        stock: o.stock,
      })) || [],
    };
  }

  async create(dto: CreateProductoDto) {
    let idProducto = dto.idProducto;
    if (!idProducto) {
      const maxItem = await this.repo
        .createQueryBuilder('p')
        .select('MAX(p.idProducto)', 'max')
        .getRawOne();
      idProducto = (maxItem?.max || 0) + 1;
    }

    const prod = this.repo.create({
      idProducto,
      nombreProd: dto.nombreProd,
      precio: dto.precio || 0,
      categoria: dto.categoria || 'GENERAL',
      descripcionProd: dto.descripcionProd,
    });

    const saved = await this.repo.save(prod);
    return this.findOne(saved.idProducto);
  }

  async update(id: number, dto: UpdateProductoDto) {
    const prod = await this.repo.findOne({ where: { idProducto: id } });
    if (!prod) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    if (dto.nombreProd !== undefined) prod.nombreProd = dto.nombreProd;
    if (dto.precio !== undefined) prod.precio = dto.precio;
    if (dto.categoria !== undefined) prod.categoria = dto.categoria;
    if (dto.descripcionProd !== undefined) prod.descripcionProd = dto.descripcionProd;

    await this.repo.save(prod);
    return this.findOne(id);
  }

  async delete(id: number) {
    const prod = await this.repo.findOne({ where: { idProducto: id } });
    if (!prod) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    await this.repo.delete(id);
    return { message: `Producto con ID ${id} eliminado exitosamente` };
  }
}
