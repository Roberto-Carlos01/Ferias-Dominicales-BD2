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
import { InstitucionesService } from './instituciones.service';
import { CreateInstitucionDto, UpdateInstitucionDto } from './dto/institucion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Instituciones')
@Controller('instituciones')
export class InstitucionesController {
  constructor(private readonly service: InstitucionesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar instituciones (Público)' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.service.findAll(pagination, search);
  }

  @Public()
  @Get(':nit')
  @ApiOperation({ summary: 'Obtener detalle de una institución (Público)' })
  findOne(@Param('nit') nit: string) {
    return this.service.findOne(nit);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crear una institución (Solo ADMIN)' })
  create(@Body() dto: CreateInstitucionDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':nit')
  @ApiOperation({ summary: 'Actualizar datos de una institución (Solo ADMIN)' })
  update(@Param('nit') nit: string, @Body() dto: UpdateInstitucionDto) {
    return this.service.update(nit, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':nit')
  @ApiOperation({ summary: 'Eliminar una institución (Solo ADMIN)' })
  delete(@Param('nit') nit: string) {
    return this.service.delete(nit);
  }
}
