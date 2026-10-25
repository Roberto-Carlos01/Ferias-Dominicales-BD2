import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Feria } from '../ferias/feria.entity';
import { Expositor } from '../expositores/expositor.entity';
import { Institucion } from '../instituciones/institucion.entity';
import { Producto } from '../productos/producto.entity';
import { Stand } from '../stands/stand.entity';
import { Usuario } from '../users/usuario.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Feria)
    private readonly feriaRepo: Repository<Feria>,
    @InjectRepository(Expositor)
    private readonly expositorRepo: Repository<Expositor>,
    @InjectRepository(Institucion)
    private readonly institucionRepo: Repository<Institucion>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Stand)
    private readonly standRepo: Repository<Stand>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async getStats() {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalFerias,
      feriasActivas,
      feriasProximas,
      totalExpositores,
      totalInstituciones,
      totalProductos,
      totalStands,
      totalUsuarios,
    ] = await Promise.all([
      this.feriaRepo.count(),
      this.feriaRepo.count({ where: { estado: 'ACTIVA' } }),
      this.feriaRepo.count({ where: { fechaIni: MoreThanOrEqual(today) } }),
      this.expositorRepo.count(),
      this.institucionRepo.count(),
      this.productoRepo.count(),
      this.standRepo.count(),
      this.usuarioRepo.count(),
    ]);

    return {
      totalFerias,
      feriasActivas,
      feriasProximas,
      totalExpositores,
      totalInstituciones,
      totalProductos,
      totalStands,
      totalUsuarios,
      timestamp: new Date().toISOString(),
    };
  }
}
