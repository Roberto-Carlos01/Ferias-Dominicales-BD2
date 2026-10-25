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
import { UbicacionesService } from './ubicaciones.service';
import { CreateUbicacionDto, UpdateUbicacionDto } from './dto/ubicacion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Ubicaciones')
@Controller('ubicaciones')
export class UbicacionesController {
  constructor(private readonly service: UbicacionesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todas las ubicaciones (Público)' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.service.findAll(pagination, search);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una ubicación (Público)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crear una nueva ubicación (Solo ADMIN)' })
  create(@Body() dto: CreateUbicacionDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una ubicación (Solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUbicacionDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ubicación (Solo ADMIN)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
