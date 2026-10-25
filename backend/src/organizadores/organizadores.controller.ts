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
import { OrganizadoresService } from './organizadores.service';
import { CreateOrganizadorDto, UpdateOrganizadorDto } from './dto/organizador.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Organizadores')
@Controller('ferias/:feriaId/organizadores')
export class OrganizadoresController {
  constructor(private readonly service: OrganizadoresService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar organizadores de una feria (Público)' })
  findAllByFeria(@Param('feriaId', ParseIntPipe) feriaId: number) {
    return this.service.findAllByFeria(feriaId);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Vincular una institución como organizadora (Solo ADMIN)' })
  create(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Body() dto: CreateOrganizadorDto,
  ) {
    return this.service.create(feriaId, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':nit')
  @ApiOperation({ summary: 'Actualizar rol de un organizador en una feria (Solo ADMIN)' })
  update(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nit') nit: string,
    @Body() dto: UpdateOrganizadorDto,
  ) {
    return this.service.update(feriaId, nit, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':nit')
  @ApiOperation({ summary: 'Desvincular a un organizador de una feria (Solo ADMIN)' })
  delete(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nit') nit: string,
  ) {
    return this.service.delete(feriaId, nit);
  }
}
