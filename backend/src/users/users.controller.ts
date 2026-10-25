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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  LinkExpositorDto,
  UpdateStatusDto,
  UpdateRoleDto,
  ConvertirExpositorDto,
  QueryUserDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { UserRole } from './usuario.entity';

@ApiTags('Usuarios')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('usuarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios con paginación y búsqueda (Solo ADMIN)' })
  findAll(@Query() query: QueryUserDto) {
    const isSinExp = query.sinExpositor === 'true' || query.sinExpositor === true || query.sinExpositor === '1';
    const isSoloExp = query.soloExpositores === 'true' || query.soloExpositores === true || query.soloExpositores === '1';
    return this.usersService.findAll(
      { page: Number(query.page) || 1, limit: Number(query.limit) || 20 },
      query.search,
      query.rol,
      isSinExp,
      isSoloExp,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID (Solo ADMIN)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario nuevo (Solo ADMIN)' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un usuario (Solo ADMIN)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de un usuario (Solo ADMIN)' })
  updateEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return this.usersService.updateEstado(id, dto.estado);
  }

  @Patch(':id/rol')
  @ApiOperation({ summary: 'Cambiar rol de un usuario a ADMIN o USUARIO (Solo ADMIN)' })
  updateRol(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRol(id, dto.rol);
  }

  @Post(':id/convertir-expositor')
  @ApiOperation({ summary: 'Convertir usuario en expositor oficial (Solo ADMIN)' })
  convertirEnExpositor(@Param('id', ParseIntPipe) id: number, @Body() dto: ConvertirExpositorDto) {
    return this.usersService.convertirEnExpositor(id, dto);
  }

  @Patch(':id/expositor')
  @ApiOperation({ summary: 'Vincular o desvincular un expositor a una cuenta (Solo ADMIN)' })
  linkExpositor(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkExpositorDto) {
    return this.usersService.linkExpositor(id, dto.ciExpositor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario (Solo ADMIN)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}
