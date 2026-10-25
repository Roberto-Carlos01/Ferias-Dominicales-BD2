import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExpositoresService } from './expositores.service';
import { CreateExpositorDto, UpdateExpositorDto, QueryExpositorDto } from './dto/expositor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Expositores')
@Controller('expositores')
export class ExpositoresController {
  constructor(private readonly expositoresService: ExpositoresService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar expositores (Público)' })
  findAll(@Query() query: QueryExpositorDto) {
    const isMultiples = query.multiples === 'true' || query.multiples === true || query.multiples === '1';
    return this.expositoresService.findAll(
      { page: Number(query.page) || 1, limit: Number(query.limit) || 20 },
      query.search,
      isMultiples,
      query.idFeria ? Number(query.idFeria) : undefined,
    );
  }

  @Public()
  @Get(':ci')
  @ApiOperation({ summary: 'Obtener detalle de un expositor (Público)' })
  findOne(@Param('ci') ci: string) {
    return this.expositoresService.findOne(ci);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo expositor (Solo ADMIN)' })
  create(@Body() dto: CreateExpositorDto) {
    return this.expositoresService.create(dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':ci')
  @ApiOperation({ summary: 'Actualizar datos de un expositor (Solo ADMIN)' })
  update(@Param('ci') ci: string, @Body() dto: UpdateExpositorDto) {
    return this.expositoresService.update(ci, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':ci')
  @ApiOperation({ summary: 'Eliminar un expositor (Solo ADMIN)' })
  delete(@Param('ci') ci: string) {
    return this.expositoresService.delete(ci);
  }
}
