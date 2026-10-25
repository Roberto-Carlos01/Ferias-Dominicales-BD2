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
import { PatrocinadoresService } from './patrocinadores.service';
import { CreatePatrocinadorDto, UpdatePatrocinadorDto, QueryPatrocinadorDto } from './dto/patrocinador.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Patrocinadores')
@Controller('patrocinadores')
export class PatrocinadoresRootController {
  constructor(private readonly service: PatrocinadoresService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todos los patrocinadores del sistema con ferias asociadas' })
  findAll(@Query() query: QueryPatrocinadorDto) {
    return this.service.findAll(
      { page: Number(query.page) || 1, limit: Number(query.limit) || 20 },
      query.search,
      query.idFeria ? Number(query.idFeria) : undefined,
      query.tipoApoyo,
    );
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo patrocinio para una feria (Solo ADMIN)' })
  create(
    @Body() dto: CreatePatrocinadorDto & { idFeria: number },
  ) {
    return this.service.create(dto.idFeria, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':idFeria/:nit')
  @ApiOperation({ summary: 'Actualizar apoyo de un patrocinador en una feria (Solo ADMIN)' })
  update(
    @Param('idFeria', ParseIntPipe) idFeria: number,
    @Param('nit') nit: string,
    @Body() dto: UpdatePatrocinadorDto,
  ) {
    return this.service.update(idFeria, nit, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':idFeria/:nit')
  @ApiOperation({ summary: 'Eliminar un patrocinio de una feria (Solo ADMIN)' })
  delete(
    @Param('idFeria', ParseIntPipe) idFeria: number,
    @Param('nit') nit: string,
  ) {
    return this.service.delete(idFeria, nit);
  }
}
