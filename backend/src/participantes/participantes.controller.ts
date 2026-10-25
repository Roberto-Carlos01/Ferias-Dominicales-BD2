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
import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto, UpdateParticipanteDto } from './dto/participante.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Participantes')
@Controller('ferias/:feriaId/participantes')
export class ParticipantesController {
  constructor(private readonly service: ParticipantesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar participantes de una feria (Público)' })
  findAllByFeria(@Param('feriaId', ParseIntPipe) feriaId: number) {
    return this.service.findAllByFeria(feriaId);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Asignar un expositor a un stand en la feria (Solo ADMIN)' })
  create(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Body() dto: CreateParticipanteDto,
  ) {
    return this.service.create(feriaId, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':ciExpositor')
  @ApiOperation({ summary: 'Actualizar cargo o stand de un participante (Solo ADMIN)' })
  update(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('ciExpositor') ciExpositor: string,
    @Body() dto: UpdateParticipanteDto,
  ) {
    return this.service.update(feriaId, ciExpositor, dto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':ciExpositor')
  @ApiOperation({ summary: 'Desvincular a un expositor de la feria (Solo ADMIN)' })
  delete(
    @Param('feriaId', ParseIntPipe) feriaId: number,
    @Param('ciExpositor') ciExpositor: string,
  ) {
    return this.service.delete(feriaId, ciExpositor);
  }
}
