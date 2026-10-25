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
import { PatrocinadoresService } from './patrocinadores.service';
import { CreatePatrocinadorDto, UpdatePatrocinadorDto } from './dto/patrocinador.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Patrocinadores')
@Controller('ferias/:feriaId/patrocinadores')
export class PatrocinadoresController {
  constructor(private readonly service: PatrocinadoresService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar patrocinadores de una feria (Público)' })
  findAllByFeria(@Param('feriaId', ParseIntPipe) feriaId: number) {
    return this.service.findAllByFeria(feriaId);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Vincular una institución como patrocinadora (Solo ADMIN)' })
  create(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Body() dto: CreatePatrocinadorDto,
  ) {
    return this.service.create(feriaId, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':nit')
  @ApiOperation({ summary: 'Actualizar apoyo de un patrocinador en una feria (Solo ADMIN)' })
  update(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nit') nit: string,
    @Body() dto: UpdatePatrocinadorDto,
  ) {
    return this.service.update(feriaId, nit, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':nit')
  @ApiOperation({ summary: 'Desvincular a un patrocinador de una feria (Solo ADMIN)' })
  delete(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('nit') nit: string,
  ) {
    return this.service.delete(feriaId, nit);
  }
}
