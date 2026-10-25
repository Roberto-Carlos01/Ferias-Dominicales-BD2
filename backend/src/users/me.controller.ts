import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Me')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario con datos de expositor si aplica' })
  getProfile(@CurrentUser('idUsuario') idUsuario: number) {
    return this.usersService.getMe(idUsuario);
  }

  @Get('participaciones')
  @ApiOperation({ summary: 'Consultar las ferias y stands donde participa el expositor vinculado' })
  @ApiResponse({ status: 200, description: 'Lista consolidada de participaciones, productos y exposiciones' })
  getParticipaciones(@CurrentUser('idUsuario') idUsuario: number) {
    return this.usersService.getParticipaciones(idUsuario);
  }
}
