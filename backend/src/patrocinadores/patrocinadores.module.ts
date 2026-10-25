import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patrocina } from './patrocina.entity';
import { Feria } from '../ferias/feria.entity';
import { Institucion } from '../instituciones/institucion.entity';
import { PatrocinadoresService } from './patrocinadores.service';
import { PatrocinadoresController } from './patrocinadores.controller';
import { PatrocinadoresRootController } from './patrocinadores-root.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patrocina, Feria, Institucion])],
  controllers: [PatrocinadoresController, PatrocinadoresRootController],
  providers: [PatrocinadoresService],
  exports: [PatrocinadoresService],
})
export class PatrocinadoresModule {}
