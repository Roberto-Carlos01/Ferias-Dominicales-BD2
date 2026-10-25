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
import { OrganizadoresService } from './organizadores.service';
import { CreateOrganizadorDto, UpdateOrganizadorDto, QueryOrganizadorDto } from './dto/organizador.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Organizadores')
@Controller('organizadores')
export class OrganizadoresRootController {
  constructor(private readonly service: OrganizadoresService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todos los organizadores del sistema con ferias asociadas' })
  findAll(@Query() query: QueryOrganizadorDto) {
    return this.service.findAll(
      { page: Number(query.page) || 1, limit: Number(query.limit) || 20 },
      query.search,
      query.idFeria ? Number(query.idFeria) : undefined,
      query.rol,
    );
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo organizador para una feria (Solo ADMIN)' })
  create(
    @Body() dto: CreateOrganizadorDto & { idFeria: number },
  ) {
    return this.service.create(dto.idFeria, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idFeria/:nit')
  @ApiOperation({ summary: 'Actualizar rol de un organizador en una feria (Solo ADMIN)' })
  update(
    @Param('idFeria', ParseIntPipe) idFeria: number,
    @Param('nit') nit: string,
    @Body() dto: UpdateOrganizadorDto,
  ) {
    return this.service.update(idFeria, nit, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':idFeria/:nit')
  @ApiOperation({ summary: 'Eliminar un organizador de una feria (Solo ADMIN)' })
  delete(
    @Param('idFeria', ParseIntPipe) idFeria: number,
    @Param('nit') nit: string,
  ) {
    return this.service.delete(idFeria, nit);
  }
}
