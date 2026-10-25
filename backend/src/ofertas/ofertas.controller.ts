import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OfertasService } from './ofertas.service';
import { CreateOfertaDto, UpdateOfertaDto } from './dto/oferta.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Ofertas')
@Controller('ferias/:feriaId/stands/:nroStand/productos')
export class OfertasController {
  constructor(private readonly service: OfertasService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar productos ofrecidos en un stand (Público)' })
  findAllByStand(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nroStand', ParseIntPipe) nroStand: number,
  ) {
    return this.service.findAllByStand(feriaId, nroStand);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Asignar un producto y su stock a un stand (Solo ADMIN)' })
  create(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nroStand', ParseIntPipe) nroStand: number,
    @Body() dto: CreateOfertaDto,
  ) {
    return this.service.create(feriaId, nroStand, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':productoId')
  @ApiOperation({ summary: 'Actualizar stock o unidad de medida de un producto en un stand (Solo ADMIN)' })
  update(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nroStand', ParseIntPipe) nroStand: number,
    @Param('productoId', ParseIntPipe) productoId: number,
    @Body() dto: UpdateOfertaDto,
  ) {
    return this.service.update(feriaId, nroStand, productoId, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':productoId')
  @ApiOperation({ summary: 'Retirar un producto de un stand (Solo ADMIN)' })
  delete(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nroStand', ParseIntPipe) nroStand: number,
    @Param('productoId', ParseIntPipe) productoId: number,
  ) {
    return this.service.delete(feriaId, nroStand, productoId);
  }
}
