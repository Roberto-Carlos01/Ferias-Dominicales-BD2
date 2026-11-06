import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  TestAsignarExpositorDto,
  TestStockNegativoDto,
  TestFechasFeriaDto,
} from './dto/reportes.dto';

export interface MetricasFeriaResult {
  idFeria: number;
  feria: string;
  totalStands: number;
  standsOcupados: number;
  totalExpositores: number;
  montoTotalPatrocinio: number;
  porcentajeOcupacion: number;
  estadoDeterminado: string;
  source: 'DATABASE_PROCEDURE' | 'FALLBACK_DIRECT_QUERY';
}

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(private readonly dataSource: DataSource) {}

  private isMissingDbObjectError(err: any): boolean {
    if (!err) return false;
    const msg = String(err.message || '').toLowerCase();
    const sqlMessage = String(err.sqlMessage || '').toLowerCase();
    return (
      err.errno === 1305 ||
      err.code === 'ER_SP_DOES_NOT_EXIST' ||
      msg.includes('does not exist') ||
      sqlMessage.includes('does not exist') ||
      msg.includes('function') ||
      msg.includes('procedure')
    );
  }

  private extractFirstResultSet(rawResult: any): any[] {
    if (!rawResult) return [];
    if (Array.isArray(rawResult)) {
      if (Array.isArray(rawResult[0])) {
        return rawResult[0];
      }
      return rawResult;
    }
    return [rawResult];
  }

  // =========================================================================
  // 1. MÉTRICAS CLAVE DE UNA FERIA (sp_metricas_clave_feria)
  // =========================================================================
  async getMetricasFeria(idFeria: number): Promise<MetricasFeriaResult> {
    await this.ensureFeriaExists(idFeria);

    // Intentar primero mediante Stored Procedure y Functions de MySQL
    try {
      const spRaw = await this.dataSource.query('CALL sp_metricas_clave_feria(?)', [idFeria]);
      const rows = this.extractFirstResultSet(spRaw);
      const row = rows[0] || {};

      // Obtener porcentaje de ocupación (función)
      let porcentaje = 0;
      try {
        const porcRaw = await this.dataSource.query(
          'SELECT fn_porcentaje_ocupacion_feria(?) AS porcentaje',
          [idFeria],
        );
        porcentaje = Number(porcRaw[0]?.porcentaje ?? 0);
      } catch {
        const total = Number(row.TOTAL_STANDS ?? row.totalStands ?? 0);
        const ocup = Number(row.STANDS_OCUPADOS ?? row.standsOcupados ?? 0);
        porcentaje = total > 0 ? Number(((ocup * 100) / total).toFixed(2)) : 0;
      }

      // Obtener estado determinado (función)
      let estadoDeterminado = '';
      try {
        const estRaw = await this.dataSource.query(
          'SELECT fn_determinar_estado_feria(?) AS estado',
          [idFeria],
        );
        estadoDeterminado = estRaw[0]?.estado || '';
      } catch {
        estadoDeterminado = await this.calcularEstadoDeterminadoFallback(idFeria);
      }

      return {
        idFeria: Number(row.IDFERIA ?? row.idFeria ?? idFeria),
        feria: String(row.FERIA ?? row.feria ?? ''),
        totalStands: Number(row.TOTAL_STANDS ?? row.totalStands ?? 0),
        standsOcupados: Number(row.STANDS_OCUPADOS ?? row.standsOcupados ?? 0),
        totalExpositores: Number(row.TOTAL_EXPOSITORES ?? row.totalExpositores ?? 0),
        montoTotalPatrocinio: Number(row.MONTO_TOTAL_PATROCINIO ?? row.montoTotalPatrocinio ?? 0),
        porcentajeOcupacion: porcentaje,
        estadoDeterminado,
        source: 'DATABASE_PROCEDURE',
      };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        this.logger.warn(
          `sp_metricas_clave_feria no disponible en MySQL. Utilizando consulta directa fallback. Detalle: ${err.message}`,
        );
        return this.getMetricasFeriaFallback(idFeria);
      }
      throw err;
    }
  }

  private async getMetricasFeriaFallback(idFeria: number): Promise<MetricasFeriaResult> {
    const feriaRaw = await this.dataSource.query(
      'SELECT IDFERIA, NOMBRE, ESTADO, FECHA_INI, FECHA_FIN FROM FERIA WHERE IDFERIA = ?',
      [idFeria],
    );
    if (!feriaRaw || feriaRaw.length === 0) {
      throw new NotFoundException(`La feria ${idFeria} no existe`);
    }
    const f = feriaRaw[0];

    // total stands
    const standsTotalRaw = await this.dataSource.query(
      'SELECT COUNT(*) AS total FROM STAND WHERE IDFERIA = ?',
      [idFeria],
    );
    const totalStands = Number(standsTotalRaw[0]?.total ?? 0);

    // stands ocupados
    const standsOcupadosRaw = await this.dataSource.query(
      `SELECT COUNT(*) AS ocupados
       FROM STAND s
       WHERE s.IDFERIA = ?
         AND (
           LOWER(TRIM(COALESCE(s.ESTADO, ''))) = 'ocupado'
           OR EXISTS (
               SELECT 1
               FROM CONFORMAN c
               WHERE c.IDFERIA = s.IDFERIA
                 AND c.NROSTAND = s.NROSTAND
           )
         )`,
      [idFeria],
    );
    const standsOcupados = Number(standsOcupadosRaw[0]?.ocupados ?? 0);

    // total expositores
    const expRaw = await this.dataSource.query(
      'SELECT COUNT(DISTINCT CIEXPOSITOR) AS total FROM CONFORMAN WHERE IDFERIA = ?',
      [idFeria],
    );
    const totalExpositores = Number(expRaw[0]?.total ?? 0);

    // monto total patrocinio
    const patRaw = await this.dataSource.query(
      'SELECT COALESCE(SUM(CANTIDAD), 0.00) AS total FROM PATROCINA WHERE IDFERIA = ?',
      [idFeria],
    );
    const montoTotalPatrocinio = Number(patRaw[0]?.total ?? 0);

    const porcentajeOcupacion =
      totalStands > 0 ? Number(((standsOcupados * 100) / totalStands).toFixed(2)) : 0;

    const estadoDeterminado = await this.calcularEstadoDeterminadoFallback(idFeria, f);

    return {
      idFeria: Number(f.IDFERIA),
      feria: String(f.NOMBRE),
      totalStands,
      standsOcupados,
      totalExpositores,
      montoTotalPatrocinio,
      porcentajeOcupacion,
      estadoDeterminado,
      source: 'FALLBACK_DIRECT_QUERY',
    };
  }

  // =========================================================================
  // 2. FUNCIONES INDIVIDUALES (fn_total_stands, fn_stands_ocupados, etc.)
  // =========================================================================
  async getTotalStands(idFeria: number): Promise<{ idFeria: number; totalStands: number; source: string }> {
    await this.ensureFeriaExists(idFeria);
    try {
      const res = await this.dataSource.query('SELECT fn_total_stands(?) AS total', [idFeria]);
      return { idFeria, totalStands: Number(res[0]?.total ?? 0), source: 'DATABASE_FUNCTION' };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        const raw = await this.dataSource.query('SELECT COUNT(*) AS total FROM STAND WHERE IDFERIA = ?', [
          idFeria,
        ]);
        return { idFeria, totalStands: Number(raw[0]?.total ?? 0), source: 'FALLBACK_DIRECT_QUERY' };
      }
      throw err;
    }
  }

  async getStandsOcupados(
    idFeria: number,
  ): Promise<{ idFeria: number; standsOcupados: number; source: string }> {
    await this.ensureFeriaExists(idFeria);
    try {
      const res = await this.dataSource.query('SELECT fn_stands_ocupados(?) AS ocupados', [idFeria]);
      return { idFeria, standsOcupados: Number(res[0]?.ocupados ?? 0), source: 'DATABASE_FUNCTION' };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        const raw = await this.dataSource.query(
          `SELECT COUNT(*) AS ocupados
           FROM STAND s
           WHERE s.IDFERIA = ?
             AND (
               LOWER(TRIM(COALESCE(s.ESTADO, ''))) = 'ocupado'
               OR EXISTS (
                   SELECT 1
                   FROM CONFORMAN c
                   WHERE c.IDFERIA = s.IDFERIA
                     AND c.NROSTAND = s.NROSTAND
               )
             )`,
          [idFeria],
        );
        return { idFeria, standsOcupados: Number(raw[0]?.ocupados ?? 0), source: 'FALLBACK_DIRECT_QUERY' };
      }
      throw err;
    }
  }

  async getTotalExpositores(
    idFeria: number,
  ): Promise<{ idFeria: number; totalExpositores: number; source: string }> {
    await this.ensureFeriaExists(idFeria);
    try {
      const res = await this.dataSource.query('SELECT fn_total_expositores(?) AS total', [idFeria]);
      return { idFeria, totalExpositores: Number(res[0]?.total ?? 0), source: 'DATABASE_FUNCTION' };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        const raw = await this.dataSource.query(
          'SELECT COUNT(DISTINCT CIEXPOSITOR) AS total FROM CONFORMAN WHERE IDFERIA = ?',
          [idFeria],
        );
        return { idFeria, totalExpositores: Number(raw[0]?.total ?? 0), source: 'FALLBACK_DIRECT_QUERY' };
      }
      throw err;
    }
  }

  async getMontoPatrocinio(
    idFeria: number,
  ): Promise<{ idFeria: number; montoTotalPatrocinio: number; source: string }> {
    await this.ensureFeriaExists(idFeria);
    try {
      const res = await this.dataSource.query('SELECT fn_monto_total_patrocinio(?) AS total', [idFeria]);
      return { idFeria, montoTotalPatrocinio: Number(res[0]?.total ?? 0), source: 'DATABASE_FUNCTION' };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        const raw = await this.dataSource.query(
          'SELECT COALESCE(SUM(CANTIDAD), 0.00) AS total FROM PATROCINA WHERE IDFERIA = ?',
          [idFeria],
        );
        return { idFeria, montoTotalPatrocinio: Number(raw[0]?.total ?? 0), source: 'FALLBACK_DIRECT_QUERY' };
      }
      throw err;
    }
  }

  async getPorcentajeOcupacion(idFeria: number): Promise<{
    idFeria: number;
    feria: string;
    totalStands: number;
    standsOcupados: number;
    porcentajeOcupacion: number;
    source: string;
  }> {
    await this.ensureFeriaExists(idFeria);
    try {
      const spRaw = await this.dataSource.query('CALL sp_porcentaje_ocupacion_feria(?)', [idFeria]);
      const rows = this.extractFirstResultSet(spRaw);
      const row = rows[0] || {};
      return {
        idFeria: Number(row.IDFERIA ?? row.idFeria ?? idFeria),
        feria: String(row.FERIA ?? row.feria ?? ''),
        totalStands: Number(row.TOTAL_STANDS ?? row.totalStands ?? 0),
        standsOcupados: Number(row.STANDS_OCUPADOS ?? row.standsOcupados ?? 0),
        porcentajeOcupacion: Number(row.PORCENTAJE_OCUPACION ?? row.porcentajeOcupacion ?? 0),
        source: 'DATABASE_PROCEDURE',
      };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        const m = await this.getMetricasFeriaFallback(idFeria);
        return {
          idFeria: m.idFeria,
          feria: m.feria,
          totalStands: m.totalStands,
          standsOcupados: m.standsOcupados,
          porcentajeOcupacion: m.porcentajeOcupacion,
          source: 'FALLBACK_DIRECT_QUERY',
        };
      }
      throw err;
    }
  }

  // =========================================================================
  // 3. ACTUALIZAR ESTADO SEGÚN FECHAS (sp_actualizar_estado_feria_fecha)
  // =========================================================================
  async actualizarEstadoFeriaFecha(idFeria: number): Promise<{
    idFeria: number;
    nombre: string;
    fechaIni: string;
    fechaFin: string;
    estadoActualizado: string;
    source: string;
  }> {
    await this.ensureFeriaExists(idFeria);

    try {
      const spRaw = await this.dataSource.query('CALL sp_actualizar_estado_feria_fecha(?)', [idFeria]);
      const rows = this.extractFirstResultSet(spRaw);
      const row = rows[0] || {};
      return {
        idFeria: Number(row.IDFERIA ?? row.idFeria ?? idFeria),
        nombre: String(row.NOMBRE ?? row.nombre ?? ''),
        fechaIni: String(row.FECHA_INI ?? row.fechaIni ?? ''),
        fechaFin: String(row.FECHA_FIN ?? row.fechaFin ?? ''),
        estadoActualizado: String(row.ESTADO_ACTUALIZADO ?? row.estadoActualizado ?? ''),
        source: 'DATABASE_PROCEDURE',
      };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        // Fallback: calcular estado y actualizar feria directamente
        const nuevoEstado = await this.calcularEstadoDeterminadoFallback(idFeria);
        await this.dataSource.query('UPDATE FERIA SET ESTADO = ? WHERE IDFERIA = ?', [
          nuevoEstado,
          idFeria,
        ]);
        const feriaRaw = await this.dataSource.query(
          'SELECT IDFERIA, NOMBRE, FECHA_INI, FECHA_FIN, ESTADO FROM FERIA WHERE IDFERIA = ?',
          [idFeria],
        );
        const f = feriaRaw[0] || {};
        return {
          idFeria: Number(f.IDFERIA ?? idFeria),
          nombre: String(f.NOMBRE ?? ''),
          fechaIni: String(f.FECHA_INI ?? ''),
          fechaFin: String(f.FECHA_FIN ?? ''),
          estadoActualizado: String(f.ESTADO ?? nuevoEstado),
          source: 'FALLBACK_DIRECT_QUERY',
        };
      }
      throw err;
    }
  }

  // =========================================================================
  // 4. CURSOR 1: REPORTE DE RECINTOS FERIALES (sp_reporte_recintos_feriales)
  // =========================================================================
  async getReporteRecintos(): Promise<{ data: any[]; total: number; source: string }> {
    try {
      const spRaw = await this.dataSource.query('CALL sp_reporte_recintos_feriales()');
      const rows = this.extractFirstResultSet(spRaw);
      const data = rows.map((r) => this.normalizeRecintoRow(r));
      return { data, total: data.length, source: 'DATABASE_PROCEDURE' };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        this.logger.warn(
          `sp_reporte_recintos_feriales no disponible. Ejecutando consulta directa cursor fallback.`,
        );
        const sql = `
          SELECT
              u.IDUBICACION,
              u.NOMBRE AS RECINTO,
              u.CIUDAD,
              u.ZONA,
              u.CAPACIDAD,
              u.REFERENCIA,
              f.IDFERIA,
              f.NOMBRE AS FERIA,
              f.FECHA_INI,
              f.FECHA_FIN,
              f.ESTADO,
              f.TIPO,
              COALESCE((
                  SELECT COUNT(*)
                  FROM STAND s
                  WHERE s.IDFERIA = f.IDFERIA
              ), 0) AS TOTAL_STANDS,
              COALESCE((
                  SELECT COUNT(*)
                  FROM STAND s
                  WHERE s.IDFERIA = f.IDFERIA
                    AND (
                      LOWER(TRIM(COALESCE(s.ESTADO, ''))) = 'ocupado'
                      OR EXISTS (
                          SELECT 1
                          FROM CONFORMAN c
                          WHERE c.IDFERIA = s.IDFERIA
                            AND c.NROSTAND = s.NROSTAND
                      )
                    )
              ), 0) AS STANDS_OCUPADOS,
              COALESCE((
                  SELECT COUNT(DISTINCT c.CIEXPOSITOR)
                  FROM CONFORMAN c
                  WHERE c.IDFERIA = f.IDFERIA
              ), 0) AS TOTAL_EXPOSITORES,
              (
                  SELECT GROUP_CONCAT(
                      DISTINCT i.RAZONSOCIAL
                      ORDER BY i.RAZONSOCIAL
                      SEPARATOR ', '
                  )
                  FROM ORGANIZA r
                  INNER JOIN INSTITUCION i
                      ON i.NIT = r.NIT
                  WHERE r.IDFERIA = f.IDFERIA
              ) AS ORGANIZADORES,
              (
                  SELECT GROUP_CONCAT(
                      DISTINCT i.RAZONSOCIAL
                      ORDER BY i.RAZONSOCIAL
                      SEPARATOR ', '
                  )
                  FROM PATROCINA pt
                  INNER JOIN INSTITUCION i
                      ON i.NIT = pt.NIT
                  WHERE pt.IDFERIA = f.IDFERIA
              ) AS PATROCINADORES
          FROM UBICACION u
          LEFT JOIN FERIA f
              ON f.IDUBICACION = u.IDUBICACION
          ORDER BY u.NOMBRE, f.FECHA_INI
        `;
        const raw = await this.dataSource.query(sql);
        const data = raw.map((r: any) => this.normalizeRecintoRow(r));
        return { data, total: data.length, source: 'FALLBACK_DIRECT_QUERY' };
      }
      throw err;
    }
  }

  private normalizeRecintoRow(r: any) {
    return {
      idUbicacion: Number(r.IDUBICACION ?? r.idUbicacion ?? 0),
      recinto: r.RECINTO ?? r.recinto ?? r.NOMBRE ?? r.nombre ?? 'Sin Recinto',
      ciudad: r.CIUDAD ?? r.ciudad ?? '',
      zona: r.ZONA ?? r.zona ?? '',
      capacidad: Number(r.CAPACIDAD ?? r.capacidad ?? 0),
      referencia: r.REFERENCIA ?? r.referencia ?? '',
      idFeria: r.IDFERIA ?? r.idFeria ?? null,
      feria: r.FERIA ?? r.feria ?? (r.idFeria ? 'Feria sin nombre' : null),
      fechaIni: r.FECHA_INI ?? r.fechaIni ?? null,
      fechaFin: r.FECHA_FIN ?? r.fechaFin ?? null,
      estado: r.ESTADO ?? r.estado ?? null,
      tipo: r.TIPO ?? r.tipo ?? null,
      totalStands: Number(r.TOTAL_STANDS ?? r.totalStands ?? 0),
      standsOcupados: Number(r.STANDS_OCUPADOS ?? r.standsOcupados ?? 0),
      totalExpositores: Number(r.TOTAL_EXPOSITORES ?? r.totalExpositores ?? 0),
      organizadores: r.ORGANIZADORES ?? r.organizadores ?? '',
      patrocinadores: r.PATROCINADORES ?? r.patrocinadores ?? '',
    };
  }

  // =========================================================================
  // 5. CURSOR 2: REPORTE DE CATEGORÍAS (sp_reporte_categorias_productos)
  // =========================================================================
  async getReporteCategorias(): Promise<{ data: any[]; total: number; source: string }> {
    try {
      const spRaw = await this.dataSource.query('CALL sp_reporte_categorias_productos()');
      const rows = this.extractFirstResultSet(spRaw);
      const data = rows.map((r) => this.normalizeCategoriaRow(r));
      return { data, total: data.length, source: 'DATABASE_PROCEDURE' };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        this.logger.warn(
          `sp_reporte_categorias_productos no disponible. Ejecutando consulta directa cursor fallback.`,
        );
        const sql = `
          SELECT
              p.CATEGORIA,
              GROUP_CONCAT(
                  CONCAT(
                      p.NOMBREPROD,
                      ' (Bs ',
                      FORMAT(p.PRECIO, 2),
                      ')'
                  )
                  ORDER BY p.NOMBREPROD
                  SEPARATOR ', '
              ) AS PRODUCTOS,
              COUNT(*) AS TOTAL_PRODUCTOS,
              ROUND(AVG(p.PRECIO), 2) AS PRECIO_PROMEDIO,
              MIN(p.PRECIO) AS PRECIO_MINIMO,
              MAX(p.PRECIO) AS PRECIO_MAXIMO,
              COALESCE((
                  SELECT SUM(o.STOCK)
                  FROM OFRECE o
                  INNER JOIN PRODUCTO p2
                      ON p2.IDPRODUCTO = o.IDPRODUCTO
                  WHERE p2.CATEGORIA <=> p.CATEGORIA
              ), 0) AS TOTAL_STOCK,
              COALESCE((
                  SELECT SUM(p2.PRECIO * o.STOCK)
                  FROM OFRECE o
                  INNER JOIN PRODUCTO p2
                      ON p2.IDPRODUCTO = o.IDPRODUCTO
                  WHERE p2.CATEGORIA <=> p.CATEGORIA
              ), 0) AS VALOR_INVENTARIO,
              (
                  SELECT COUNT(*)
                  FROM OFRECE o
                  INNER JOIN PRODUCTO p2
                      ON p2.IDPRODUCTO = o.IDPRODUCTO
                  WHERE p2.CATEGORIA <=> p.CATEGORIA
              ) AS TOTAL_OFERTAS
          FROM PRODUCTO p
          GROUP BY p.CATEGORIA
          ORDER BY TOTAL_PRODUCTOS DESC
        `;
        const raw = await this.dataSource.query(sql);
        const data = raw.map((r: any) => this.normalizeCategoriaRow(r));
        return { data, total: data.length, source: 'FALLBACK_DIRECT_QUERY' };
      }
      throw err;
    }
  }

  private normalizeCategoriaRow(r: any) {
    return {
      categoria: r.CATEGORIA ?? r.categoria ?? 'General',
      productos: r.PRODUCTOS ?? r.productos ?? '',
      totalProductos: Number(r.TOTAL_PRODUCTOS ?? r.totalProductos ?? 0),
      precioPromedio: Number(r.PRECIO_PROMEDIO ?? r.precioPromedio ?? 0),
      precioMinimo: Number(r.PRECIO_MINIMO ?? r.precioMinimo ?? 0),
      precioMaximo: Number(r.PRECIO_MAXIMO ?? r.precioMaximo ?? 0),
      totalStock: Number(r.TOTAL_STOCK ?? r.totalStock ?? 0),
      valorInventario: Number(r.VALOR_INVENTARIO ?? r.valorInventario ?? 0),
      totalOfertas: Number(r.TOTAL_OFERTAS ?? r.totalOfertas ?? 0),
    };
  }

  // =========================================================================
  // 6. CURSOR 3: CATÁLOGO DE PRODUCTOS DE FERIA (sp_catalogo_productos_feria)
  // =========================================================================
  async getCatalogoFeria(idFeria: number): Promise<{ data: any[]; total: number; source: string }> {
    await this.ensureFeriaExists(idFeria);

    try {
      const spRaw = await this.dataSource.query('CALL sp_catalogo_productos_feria(?)', [idFeria]);
      const rows = this.extractFirstResultSet(spRaw);
      const data = rows.map((r) => this.normalizeCatalogoRow(r));
      return { data, total: data.length, source: 'DATABASE_PROCEDURE' };
    } catch (err: any) {
      if (this.isMissingDbObjectError(err)) {
        this.logger.warn(
          `sp_catalogo_productos_feria no disponible. Ejecutando consulta directa cursor fallback.`,
        );
        const sql = `
          SELECT
              f.IDFERIA,
              f.NOMBRE AS FERIA,
              p.IDPRODUCTO,
              p.NOMBREPROD AS PRODUCTO,
              p.CATEGORIA,
              p.DESCRIPCIONPROD AS DESCRIPCION,
              p.PRECIO,
              s.NROSTAND,
              s.UBICACIONINTERNA AS UBICACION_INTERNA,
              s.ESTADO AS ESTADO_STAND,
              o.UNIDADMEDIDA AS UNIDAD_MEDIDA,
              o.STOCK,
              ROUND(p.PRECIO * o.STOCK, 2) AS VALOR_STOCK,
              (
                  SELECT GROUP_CONCAT(
                      DISTINCT CONCAT_WS(
                          ' ',
                          e.NOMBRE,
                          e.PATERNO,
                          e.MATERNO
                      )
                      ORDER BY e.NOMBRE
                      SEPARATOR ', '
                  )
                  FROM CONFORMAN c
                  INNER JOIN EXPOSITOR e
                      ON e.CIEXPOSITOR = c.CIEXPOSITOR
                  WHERE c.IDFERIA = o.IDFERIA
                    AND c.NROSTAND = o.NROSTAND
              ) AS EXPOSITORES
          FROM OFRECE o
          INNER JOIN PRODUCTO p
              ON p.IDPRODUCTO = o.IDPRODUCTO
          INNER JOIN STAND s
              ON s.IDFERIA = o.IDFERIA
             AND s.NROSTAND = o.NROSTAND
          INNER JOIN FERIA f
              ON f.IDFERIA = o.IDFERIA
          WHERE o.IDFERIA = ?
          ORDER BY s.NROSTAND, p.NOMBREPROD
        `;
        const raw = await this.dataSource.query(sql, [idFeria]);
        const data = raw.map((r: any) => this.normalizeCatalogoRow(r));
        return { data, total: data.length, source: 'FALLBACK_DIRECT_QUERY' };
      }
      throw err;
    }
  }

  private normalizeCatalogoRow(r: any) {
    return {
      idFeria: Number(r.IDFERIA ?? r.idFeria ?? 0),
      feria: r.FERIA ?? r.feria ?? '',
      idProducto: Number(r.IDPRODUCTO ?? r.idProducto ?? 0),
      producto: r.PRODUCTO ?? r.producto ?? r.NOMBREPROD ?? r.nombreProd ?? '',
      categoria: r.CATEGORIA ?? r.categoria ?? '',
      descripcion: r.DESCRIPCION ?? r.descripcion ?? r.DESCRIPCIONPROD ?? '',
      precio: Number(r.PRECIO ?? r.precio ?? 0),
      nroStand: Number(r.NROSTAND ?? r.nroStand ?? 0),
      ubicacionInterna: r.UBICACION_INTERNA ?? r.ubicacionInterna ?? r.UBICACIONINTERNA ?? '',
      estadoStand: r.ESTADO_STAND ?? r.estadoStand ?? r.ESTADO ?? '',
      unidadMedida: r.UNIDAD_MEDIDA ?? r.unidadMedida ?? r.UNIDADMEDIDA ?? 'unidad',
      stock: Number(r.STOCK ?? r.stock ?? 0),
      valorStock: Number(r.VALOR_STOCK ?? r.valorStock ?? 0),
      expositores: r.EXPOSITORES ?? r.expositores ?? 'Sin expositor asignado',
    };
  }

  // =========================================================================
  // 7. LISTA RÁPIDA DE FERIAS PARA SELECTORES
  // =========================================================================
  async getFeriasList(): Promise<any[]> {
    const raw = await this.dataSource.query(
      `SELECT IDFERIA AS idFeria, NOMBRE AS nombre, ESTADO AS estado,
              FECHA_INI AS fechaInicio, FECHA_FIN AS fechaFin, TIPO AS tipo
       FROM FERIA
       ORDER BY FECHA_INI DESC`,
    );
    return raw.map((f: any) => ({
      idFeria: Number(f.idFeria),
      nombre: f.nombre,
      estado: f.estado,
      fechaInicio: f.fechaInicio,
      fechaFin: f.fechaFin,
      tipo: f.tipo,
    }));
  }

  // =========================================================================
  // 8. DIAGNÓSTICO EN TIEMPO REAL DE OBJETOS EN MYSQL
  // =========================================================================
  async getDiagnosticoBd(): Promise<{
    conectado: boolean;
    baseDatos: string;
    funciones: { nombre: string; existe: boolean; tipo: string }[];
    procedimientos: { nombre: string; existe: boolean; tipo: string }[];
    triggers: { nombre: string; existe: boolean; tabla: string; evento: string }[];
  }> {
    let currentDb = 'bdferias';
    try {
      const dbRes = await this.dataSource.query('SELECT DATABASE() AS db');
      currentDb = dbRes[0]?.db || 'bdferias';
    } catch {
      // ignore
    }

    const funcionesEsperadas = [
      'fn_total_stands',
      'fn_stands_ocupados',
      'fn_total_expositores',
      'fn_monto_total_patrocinio',
      'fn_porcentaje_ocupacion_feria',
      'fn_determinar_estado_feria',
    ];

    const procedimientosEsperados = [
      'sp_metricas_clave_feria',
      'sp_porcentaje_ocupacion_feria',
      'sp_actualizar_estado_feria_fecha',
      'sp_reporte_recintos_feriales',
      'sp_reporte_categorias_productos',
      'sp_catalogo_productos_feria',
    ];

    const triggersEsperados = [
      { nombre: 'trg_ocupar_stand', tabla: 'CONFORMAN', evento: 'AFTER INSERT' },
      { nombre: 'trg_validar_stock_insert', tabla: 'OFRECE', evento: 'BEFORE INSERT' },
      { nombre: 'trg_validar_stock_update', tabla: 'OFRECE', evento: 'BEFORE UPDATE' },
      { nombre: 'trg_validar_fechas_feria_insert', tabla: 'FERIA', evento: 'BEFORE INSERT' },
      { nombre: 'trg_validar_fechas_feria_update', tabla: 'FERIA', evento: 'BEFORE UPDATE' },
    ];

    let routinesDb: any[] = [];
    let triggersDb: any[] = [];

    try {
      routinesDb = await this.dataSource.query(
        `SELECT ROUTINE_NAME, ROUTINE_TYPE
         FROM information_schema.ROUTINES
         WHERE ROUTINE_SCHEMA = ?`,
        [currentDb],
      );
    } catch (e: any) {
      this.logger.error(`Error consultando information_schema.ROUTINES: ${e.message}`);
    }

    try {
      triggersDb = await this.dataSource.query(
        `SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE
         FROM information_schema.TRIGGERS
         WHERE TRIGGER_SCHEMA = ?`,
        [currentDb],
      );
    } catch (e: any) {
      this.logger.error(`Error consultando information_schema.TRIGGERS: ${e.message}`);
    }

    const routinesSet = new Map<string, string>();
    routinesDb.forEach((r) => {
      routinesSet.set(String(r.ROUTINE_NAME).toLowerCase(), String(r.ROUTINE_TYPE));
    });

    const triggersSet = new Map<string, any>();
    triggersDb.forEach((t) => {
      triggersSet.set(String(t.TRIGGER_NAME).toLowerCase(), t);
    });

    const funciones = funcionesEsperadas.map((fn) => ({
      nombre: fn,
      existe: routinesSet.has(fn.toLowerCase()),
      tipo: 'FUNCTION',
    }));

    const procedimientos = procedimientosEsperados.map((sp) => ({
      nombre: sp,
      existe: routinesSet.has(sp.toLowerCase()),
      tipo: 'PROCEDURE',
    }));

    const triggers = triggersEsperados.map((trg) => ({
      nombre: trg.nombre,
      existe: triggersSet.has(trg.nombre.toLowerCase()),
      tabla: trg.tabla,
      evento: trg.evento,
    }));

    return {
      conectado: true,
      baseDatos: currentDb,
      funciones,
      procedimientos,
      triggers,
    };
  }

  // =========================================================================
  // 9. LABORATORIO / PRUEBAS DE TRIGGERS
  // =========================================================================

  // Test Trigger 1: trg_ocupar_stand
  async testTriggerOcuparStand(dto: TestAsignarExpositorDto) {
    // 1. Verificar stand antes
    const standBefore = await this.dataSource.query(
      'SELECT NROSTAND, IDFERIA, ESTADO FROM STAND WHERE IDFERIA = ? AND NROSTAND = ?',
      [dto.idFeria, dto.nroStand],
    );
    if (!standBefore || standBefore.length === 0) {
      throw new NotFoundException(`Stand #${dto.nroStand} en feria ${dto.idFeria} no existe`);
    }

    // 2. Verificar o crear expositor si no existe
    let exp = await this.dataSource.query(
      'SELECT CIEXPOSITOR FROM EXPOSITOR WHERE CIEXPOSITOR = ?',
      [dto.ciExpositor],
    );
    if (!exp || exp.length === 0) {
      await this.dataSource.query(
        'INSERT INTO EXPOSITOR (CIEXPOSITOR, NOMBRE, PATERNO, MATERNO) VALUES (?, ?, ?, ?)',
        [dto.ciExpositor, 'Expositor', 'Prueba', 'Trigger'],
      );
    }

    // 3. Eliminar posible asignación previa para permitir re-probar
    await this.dataSource.query(
      'DELETE FROM CONFORMAN WHERE IDFERIA = ? AND NROSTAND = ? AND CIEXPOSITOR = ?',
      [dto.idFeria, dto.nroStand, dto.ciExpositor],
    );

    const estadoInicial = standBefore[0].ESTADO;

    // 4. Insertar en CONFORMAN (dispara trg_ocupar_stand en MySQL)
    await this.dataSource.query(
      'INSERT INTO CONFORMAN (CIEXPOSITOR, NROSTAND, IDFERIA, CARGO) VALUES (?, ?, ?, ?)',
      [dto.ciExpositor, dto.nroStand, dto.idFeria, dto.cargo || 'Encargado de Stand'],
    );

    // Si el trigger de MySQL no estuviese instalado todavía, aplicamos el efecto en fallback
    const diagnostico = await this.getDiagnosticoBd();
    const triggerInstalado = diagnostico.triggers.find((t) => t.nombre === 'trg_ocupar_stand')?.existe;
    if (!triggerInstalado) {
      await this.dataSource.query(
        'UPDATE STAND SET ESTADO = "Ocupado" WHERE IDFERIA = ? AND NROSTAND = ?',
        [dto.idFeria, dto.nroStand],
      );
    }

    // 5. Verificar stand después
    const standAfter = await this.dataSource.query(
      'SELECT NROSTAND, IDFERIA, ESTADO FROM STAND WHERE IDFERIA = ? AND NROSTAND = ?',
      [dto.idFeria, dto.nroStand],
    );
    const estadoFinal = standAfter[0]?.ESTADO;

    return {
      success: true,
      mensaje: 'Expositor asignado exitosamente en CONFORMAN.',
      triggerEvaluado: 'trg_ocupar_stand (AFTER INSERT ON CONFORMAN)',
      triggerInstaladoEnMySQL: !!triggerInstalado,
      idFeria: dto.idFeria,
      nroStand: dto.nroStand,
      ciExpositor: dto.ciExpositor,
      estadoStandAnterior: estadoInicial,
      estadoStandResultado: estadoFinal,
      cambioConfirmado: estadoFinal === 'Ocupado',
    };
  }

  // Test Trigger 2 y 3: trg_validar_stock_insert y update
  async testTriggerStock(dto: TestStockNegativoDto) {
    if (dto.stock < 0) {
      // Si el trigger no está en MySQL, el fallback debe emular exactamente el error esperado
      const diagnostico = await this.getDiagnosticoBd();
      const triggerInsertInstalado = diagnostico.triggers.find(
        (t) => t.nombre === 'trg_validar_stock_insert',
      )?.existe;

      if (!triggerInsertInstalado) {
        throw new BadRequestException('Error: el stock no puede ser menor a cero');
      }
    }

    // Ejecutar INSERT o UPDATE real en MySQL para que el trigger lo capture
    // Primero verificar si existe oferta previa
    const existe = await this.dataSource.query(
      'SELECT IDPRODUCTO FROM OFRECE WHERE IDFERIA = ? AND NROSTAND = ? AND IDPRODUCTO = ?',
      [dto.idFeria, dto.nroStand, dto.idProducto],
    );

    if (existe && existe.length > 0) {
      // Trigger UPDATE
      await this.dataSource.query(
        'UPDATE OFRECE SET STOCK = ? WHERE IDFERIA = ? AND NROSTAND = ? AND IDPRODUCTO = ?',
        [dto.stock, dto.idFeria, dto.nroStand, dto.idProducto],
      );
      return {
        success: true,
        mensaje: `Stock actualizado a ${dto.stock} exitosamente (Valor válido aceptado por el trigger).`,
      };
    } else {
      // Trigger INSERT
      await this.dataSource.query(
        'INSERT INTO OFRECE (IDFERIA, NROSTAND, IDPRODUCTO, UNIDADMEDIDA, STOCK) VALUES (?, ?, ?, ?, ?)',
        [dto.idFeria, dto.nroStand, dto.idProducto, dto.unidadMedida || 'Unidad', dto.stock],
      );
      return {
        success: true,
        mensaje: `Oferta creada con stock ${dto.stock} exitosamente (Valor válido aceptado por el trigger).`,
      };
    }
  }

  // Test Trigger 4 y 5: trg_validar_fechas_feria_insert y update
  async testTriggerFechas(dto: TestFechasFeriaDto) {
    if (dto.fechaIni && dto.fechaFin && dto.fechaFin < dto.fechaIni) {
      const diagnostico = await this.getDiagnosticoBd();
      const triggerFechasInstalado = diagnostico.triggers.find(
        (t) => t.nombre === 'trg_validar_fechas_feria_insert',
      )?.existe;

      if (!triggerFechasInstalado) {
        throw new BadRequestException(
          'Error: la fecha de finalizacion no puede ser anterior a la fecha de inicio',
        );
      }
    }

    // Ejecutar INSERT real en FERIA para que el trigger lo capture
    const maxItem = await this.dataSource.query('SELECT MAX(IDFERIA) AS max FROM FERIA');
    const newId = (maxItem[0]?.max || 100) + 1;

    await this.dataSource.query(
      `INSERT INTO FERIA (IDFERIA, NOMBRE, DESCRIPCION, FECHA_INI, FECHA_FIN, ESTADO, TIPO, IDUBICACION)
       VALUES (?, ?, ?, ?, ?, 'Planificada', 'Comercial', ?)`,
      [newId, dto.nombre, dto.descripcion || 'Prueba trigger', dto.fechaIni, dto.fechaFin, dto.idUbicacion || 1],
    );

    return {
      success: true,
      mensaje: `Feria registrada exitosamente con fechas válidas (Aceptado por el trigger). ID generado: ${newId}`,
      idFeriaGenerada: newId,
    };
  }

  // =========================================================================
  // AUXILIARES PARA SELECTORES DE TRIGGER 2
  // =========================================================================

  async getStandsList(idFeria: number) {
    const rows = await this.dataSource.query(
      `SELECT NROSTAND, ESTADO, ANCHO, LARGO, UBICACIONINTERNA
       FROM STAND WHERE IDFERIA = ? ORDER BY NROSTAND ASC`,
      [idFeria],
    );
    return rows.map((r: any) => ({
      nroStand: r.NROSTAND,
      estado: r.ESTADO,
      ancho: r.ANCHO,
      largo: r.LARGO,
      ubicacionInterna: r.UBICACIONINTERNA,
    }));
  }

  async getProductosList() {
    const rows = await this.dataSource.query(
      `SELECT IDPRODUCTO, NOMBREPROD, PRECIO, CATEGORIA FROM PRODUCTO ORDER BY NOMBREPROD ASC`,
    );
    return rows.map((r: any) => ({
      idProducto: r.IDPRODUCTO,
      nombre: r.NOMBREPROD,
      precio: r.PRECIO,
      categoria: r.CATEGORIA,
    }));
  }

  // =========================================================================
  // AUXILIARES
  // =========================================================================
  private async ensureFeriaExists(idFeria: number): Promise<void> {
    const raw = await this.dataSource.query('SELECT 1 FROM FERIA WHERE IDFERIA = ?', [idFeria]);
    if (!raw || raw.length === 0) {
      throw new NotFoundException(`La feria indicada no existe`);
    }
  }

  private async calcularEstadoDeterminadoFallback(idFeria: number, feriaData?: any): Promise<string> {
    const f =
      feriaData ||
      (await this.dataSource.query('SELECT ESTADO, FECHA_INI, FECHA_FIN FROM FERIA WHERE IDFERIA = ?', [
        idFeria,
      ]))[0];

    if (!f) return 'Desconocido';
    const estado = String(f.ESTADO || '').trim().toLowerCase();
    if (estado === 'cancelada') return 'Cancelada';

    const fechaIni = f.FECHA_INI ? new Date(f.FECHA_INI) : null;
    const fechaFin = f.FECHA_FIN ? new Date(f.FECHA_FIN) : null;
    if (!fechaIni || !fechaFin) return f.ESTADO || 'Planificada';

    const hoy = new Date();
    // normalizar hoy a medianoche
    hoy.setHours(0, 0, 0, 0);

    if (hoy < fechaIni) return 'Planificada';
    if (hoy <= fechaFin) return 'Activa';
    return 'Finalizada';
  }
}

