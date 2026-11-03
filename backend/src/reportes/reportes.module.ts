import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Feria } from '../ferias/feria.entity';
import { Stand } from '../stands/stand.entity';
import { Conforman } from '../participantes/conforman.entity';
import { Ofrece } from '../ofertas/ofrece.entity';
import { Expositor } from '../expositores/expositor.entity';
import { Producto } from '../productos/producto.entity';
import { Patrocina } from '../patrocinadores/patrocina.entity';
import { Organiza } from '../organizadores/organiza.entity';
import { Ubicacion } from '../ubicaciones/ubicacion.entity';
import { Institucion } from '../instituciones/institucion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feria,
      Stand,
      Conforman,
      Ofrece,
      Expositor,
      Producto,
      Patrocina,
      Organiza,
      Ubicacion,
      Institucion,
    ]),
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}

