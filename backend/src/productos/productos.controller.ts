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
import { ProductosService } from './productos.service';
import { CreateProductoDto, UpdateProductoDto, QueryProductoDto } from './dto/producto.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar productos con paginación y búsqueda (Público)' })
  findAll(@Query() query: QueryProductoDto) {
    return this.service.findAll(
      { page: Number(query.page) || 1, limit: Number(query.limit) || 20 },
      query.search,
      query.categoria,
      query.idFeria ? Number(query.idFeria) : undefined,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un producto (Público)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto (Solo ADMIN)' })
  create(@Body() dto: CreateProductoDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un producto (Solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto (Solo ADMIN)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
