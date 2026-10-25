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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeriasService } from './ferias.service';
import { CreateFeriaDto, UpdateFeriaDto, QueryFeriaDto } from './dto/feria.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Ferias')
@Controller('ferias')
export class FeriasController {
  constructor(private readonly feriasService: FeriasService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar ferias con filtros y paginación (Público)' })
  findAll(@Query() query: QueryFeriaDto) {
    return this.feriasService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una feria por ID (Público)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feriasService.findOne(id);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crear una feria nueva (Solo ADMIN)' })
  create(@Body() dto: CreateFeriaDto) {
    return this.feriasService.create(dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de una feria (Solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFeriaDto) {
    return this.feriasService.update(id, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una feria (Solo ADMIN)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.feriasService.delete(id);
  }
}
