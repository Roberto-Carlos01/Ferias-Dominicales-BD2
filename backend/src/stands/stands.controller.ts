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
import { StandsService } from './stands.service';
import { CreateStandDto, UpdateStandDto } from './dto/stand.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Stands')
@Controller('ferias/:feriaId/stands')
export class StandsController {
  constructor(private readonly standsService: StandsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar stands de una feria (Público)' })
  findAllByFeria(@Param('feriaId', ParseIntPipe) feriaId: number) {
    return this.standsService.findAllByFeria(feriaId);
  }

  @Public()
  @Get(':nroStand')
  @ApiOperation({ summary: 'Obtener detalle de un stand en una feria (Público)' })
  findOne(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nroStand', ParseIntPipe) nroStand: number,
  ) {
    return this.standsService.findOne(feriaId, nroStand);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crear un stand para una feria (Solo ADMIN)' })
  create(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Body() dto: CreateStandDto,
  ) {
    return this.standsService.create(feriaId, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':nroStand')
  @ApiOperation({ summary: 'Actualizar un stand de una feria (Solo ADMIN)' })
  update(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nroStand', ParseIntPipe) nroStand: number,
    @Body() dto: UpdateStandDto,
  ) {
    return this.standsService.update(feriaId, nroStand, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':nroStand')
  @ApiOperation({ summary: 'Eliminar un stand de una feria (Solo ADMIN)' })
  delete(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nroStand', ParseIntPipe) nroStand: number,
  ) {
    return this.standsService.delete(feriaId, nroStand);
  }
}
