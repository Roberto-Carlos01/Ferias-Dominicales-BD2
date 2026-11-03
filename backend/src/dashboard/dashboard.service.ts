import { Injectable, NotFoundException, } from '@nestjs/common';
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
  async getMetricasFeria(idFeria: number) {
    const existe = await this.feriaRepo.query(
      `SELECT IDFERIA
      FROM FERIA
      WHERE IDFERIA = ?
      LIMIT 1`,
      [idFeria],
    );

    if (!existe.length) {
      throw new NotFoundException(
        'La feria indicada no existe',
      );
    }

    // 2. Ejecutar el procedimiento almacenado.
    const resultado = await this.feriaRepo.query(
      'CALL sp_metricas_clave_feria(?)',
      [idFeria],
    );

    // 3. Obtener la primera fila del procedimiento.
    const filas = Array.isArray(resultado?.[0])
      ? resultado[0]
      : resultado;

    const datos = Array.isArray(filas)
      ? filas[0]
      : undefined;

    if (!datos) {
      throw new NotFoundException(
        'No se encontraron métricas para la feria',
      );
    }

    // 4. Ejecutar las dos funciones MySQL.
    const funciones = await this.feriaRepo.query(
      `SELECT
        fn_porcentaje_ocupacion_feria(?)
          AS PORCENTAJE_OCUPACION,

        fn_monto_patrocinio_feria(?)
          AS MONTO_TOTAL_PATROCINIO`,
      [idFeria, idFeria],
    );

    // 5. Combinar los resultados.
    return {
      ...datos,
      ...(funciones[0] ?? {}),
    };
  }
}
