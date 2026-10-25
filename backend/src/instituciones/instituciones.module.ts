import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institucion } from './institucion.entity';
import { InstitucionesService } from './instituciones.service';
import { InstitucionesController } from './instituciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Institucion])],
  controllers: [InstitucionesController],
  providers: [InstitucionesService],
  exports: [InstitucionesService],
})
export class InstitucionesModule {}
