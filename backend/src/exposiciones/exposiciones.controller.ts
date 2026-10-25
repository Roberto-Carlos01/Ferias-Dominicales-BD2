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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExposicionesService } from './exposiciones.service';
import { CreateExposicionDto, UpdateExposicionDto } from './dto/exposicion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Exposiciones')
@Controller()
export class ExposicionesController {
  constructor(private readonly service: ExposicionesService) {}

  @Public()
  @Get('exposiciones')
  @ApiOperation({ summary: 'Listar todas las exposiciones (Público)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'idFeria', required: false, type: Number })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('idFeria') idFeria?: number,
  ) {
    return this.service.findAll(pagination, search, idFeria ? Number(idFeria) : undefined);
  }

  @Public()
  @Get('ferias/:feriaId/exposiciones')
  @ApiOperation({ summary: 'Listar exposiciones de una feria específica (Público)' })
  findAllByFeria(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.service.findAll(pagination, undefined, feriaId);
  }

  @Public()
  @Get('exposiciones/:id')
  @ApiOperation({ summary: 'Obtener detalle de una exposición (Público)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('exposiciones')
  @ApiOperation({ summary: 'Crear una nueva exposición (Solo ADMIN)' })
  create(@Body() dto: CreateExposicionDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('ferias/:feriaId/exposiciones')
  @ApiOperation({ summary: 'Crear una nueva exposición para una feria (Solo ADMIN)' })
  createForFeria(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Body() dto: CreateExposicionDto,
  ) {
    dto.idFeria = feriaId;
    return this.service.create(dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('exposiciones/:id')
  @ApiOperation({ summary: 'Actualizar una exposición (Solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExposicionDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('exposiciones/:id')
  @ApiOperation({ summary: 'Eliminar una exposición (Solo ADMIN)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
