import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { Public } from '../common/decorators/public.decorator';
import {
  TestAsignarExpositorDto,
  TestStockNegativoDto,
  TestFechasFeriaDto,
} from './dto/reportes.dto';

@ApiTags('Reportes & Procedimientos Almacenados')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  @Public()
  @Get('ferias-list')
  @ApiOperation({ summary: 'Obtener lista de ferias para selectores de reportes' })
  getFeriasList() {
    return this.service.getFeriasList();
  }

  @Public()
  @Get('diagnostico-bd')
  @ApiOperation({
    summary: 'Diagnóstico en tiempo real de funciones, procedimientos y triggers instalados en MySQL',
  })
  getDiagnosticoBd() {
    return this.service.getDiagnosticoBd();
  }

  // =========================================================================
  // CURSORES
  // =========================================================================

  @Public()
  @Get('recintos-feriales')
  @ApiOperation({
    summary: 'Cursor 1: Reporte de recintos feriales y ferias (sp_reporte_recintos_feriales)',
  })
  @ApiResponse({ status: 200, description: 'Listado generado por el cursor de recintos' })
  getReporteRecintos() {
    return this.service.getReporteRecintos();
  }

  @Public()
  @Get('categorias-productos')
  @ApiOperation({
    summary: 'Cursor 2: Reporte estadístico por categorías (sp_reporte_categorias_productos)',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas generadas por el cursor de categorías' })
  getReporteCategorias() {
    return this.service.getReporteCategorias();
  }

  @Public()
  @Get('ferias/:id/catalogo')
  @ApiOperation({
    summary: 'Cursor 3: Catálogo detallado de productos por feria (sp_catalogo_productos_feria)',
  })
  @ApiResponse({ status: 200, description: 'Catálogo generado por el cursor de la feria' })
  getCatalogoFeria(@Param('id', ParseIntPipe) id: number) {
    return this.service.getCatalogoFeria(id);
  }

  // =========================================================================
  // FUNCIONES Y PROCEDIMIENTOS DE MÉTRICAS
  // =========================================================================

  @Public()
  @Get('ferias/:id/metricas')
  @ApiOperation({
    summary: 'Procedimiento: Métricas clave consolidadas de una feria (sp_metricas_clave_feria)',
  })
  getMetricasFeria(@Param('id', ParseIntPipe) id: number) {
    return this.service.getMetricasFeria(id);
  }

  @Public()
  @Get('ferias/:id/total-stands')
  @ApiOperation({ summary: 'Función: Total de stands de una feria (fn_total_stands)' })
  getTotalStands(@Param('id', ParseIntPipe) id: number) {
    return this.service.getTotalStands(id);
  }

  @Public()
  @Get('ferias/:id/stands-ocupados')
  @ApiOperation({ summary: 'Función: Stands ocupados de una feria (fn_stands_ocupados)' })
  getStandsOcupados(@Param('id', ParseIntPipe) id: number) {
    return this.service.getStandsOcupados(id);
  }

  @Public()
  @Get('ferias/:id/expositores')
  @ApiOperation({ summary: 'Función: Total de expositores de una feria (fn_total_expositores)' })
  getTotalExpositores(@Param('id', ParseIntPipe) id: number) {
    return this.service.getTotalExpositores(id);
  }

  @Public()
  @Get('ferias/:id/patrocinio')
  @ApiOperation({
    summary: 'Función: Monto total de patrocinio de una feria (fn_monto_total_patrocinio)',
  })
  getMontoPatrocinio(@Param('id', ParseIntPipe) id: number) {
    return this.service.getMontoPatrocinio(id);
  }

  @Public()
  @Get('ferias/:id/ocupacion')
  @ApiOperation({
    summary: 'Procedimiento / Función: Porcentaje de ocupación (sp_porcentaje_ocupacion_feria)',
  })
  getPorcentajeOcupacion(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPorcentajeOcupacion(id);
  }

  @Public()
  @Post('ferias/:id/actualizar-estado')
  @ApiOperation({
    summary: 'Procedimiento: Actualizar estado de feria según fechas (sp_actualizar_estado_feria_fecha)',
  })
  actualizarEstadoFeria(@Param('id', ParseIntPipe) id: number) {
    return this.service.actualizarEstadoFeriaFecha(id);
  }

  // =========================================================================
  // LABORATORIO Y VERIFICACIÓN DE TRIGGERS
  // =========================================================================

  @Public()
  @Post('triggers/test-asignar-expositor')
  @ApiOperation({
    summary: 'Verificar Trigger 1: Ocupar stand al insertar en CONFORMAN (trg_ocupar_stand)',
  })
  testTriggerOcuparStand(@Body() dto: TestAsignarExpositorDto) {
    return this.service.testTriggerOcuparStand(dto);
  }

  @Public()
  @Get('ferias/:id/stands-lista')
  @ApiOperation({ summary: 'Listar stands de una feria para selectores (Trigger 2)' })
  getStandsList(@Param('id', ParseIntPipe) id: number) {
    return this.service.getStandsList(id);
  }

  @Public()
  @Get('productos-lista')
  @ApiOperation({ summary: 'Listar todos los productos para selectores (Trigger 2)' })
  getProductosList() {
    return this.service.getProductosList();
  }

  @Public()
  @Post('triggers/test-stock-negativo')
  @ApiOperation({
    summary:
      'Verificar Trigger 2 y 3: Validar stock negativo en OFRECE (trg_validar_stock_insert / update)',
  })
  testTriggerStock(@Body() dto: TestStockNegativoDto) {
    return this.service.testTriggerStock(dto);
  }

  @Public()
  @Post('triggers/test-fechas-feria')
  @ApiOperation({
    summary:
      'Verificar Trigger 4 y 5: Validar fechas en FERIA (trg_validar_fechas_feria_insert / update)',
  })
  testTriggerFechas(@Body() dto: TestFechasFeriaDto) {
    return this.service.testTriggerFechas(dto);
  }
}

