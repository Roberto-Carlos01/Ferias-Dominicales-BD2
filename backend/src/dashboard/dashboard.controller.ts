import { Controller, Get } from '@nestjs/common';
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
}
