import { Controller, Get, Param, ParseIntPipe, } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Obtener métricas y estadísticas consolidadas del sistema (Público)' })
  @ApiResponse({ status: 200, description: 'Estadísticas globales para el portal y panel admin' })
  getStats() {
    
    return this.service.getStats();
  }
  @Public()
    @Get('ferias/:id/metricas')
    @ApiOperation({
      summary: 'Obtener métricas de una feria',
    })
    @ApiResponse({
      status: 200,
      description: 'Métricas de la feria obtenidas correctamente',
    })
    getMetricasFeria(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.service.getMetricasFeria(id);
    }
}
