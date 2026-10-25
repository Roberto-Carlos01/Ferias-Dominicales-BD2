import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feria } from '../ferias/feria.entity';
import { Expositor } from '../expositores/expositor.entity';
import { Institucion } from '../instituciones/institucion.entity';
import { Producto } from '../productos/producto.entity';
import { Stand } from '../stands/stand.entity';
import { Usuario } from '../users/usuario.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feria,
      Expositor,
      Institucion,
      Producto,
      Stand,
      Usuario,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
