import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { Expositor } from '../expositores/expositor.entity';
import { Conforman } from '../participantes/conforman.entity';
import { Ofrece } from '../ofertas/ofrece.entity';
import { Exposicion } from '../exposiciones/exposicion.entity';
import { Organiza } from '../organizadores/organiza.entity';
import { Patrocina } from '../patrocinadores/patrocina.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MeController } from './me.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Expositor,
      Conforman,
      Ofrece,
      Exposicion,
      Organiza,
      Patrocina,
    ]),
  ],
  controllers: [UsersController, MeController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
