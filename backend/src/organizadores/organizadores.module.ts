import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organiza } from './organiza.entity';
import { Feria } from '../ferias/feria.entity';
import { Institucion } from '../instituciones/institucion.entity';
import { OrganizadoresService } from './organizadores.service';
import { OrganizadoresController } from './organizadores.controller';
import { OrganizadoresRootController } from './organizadores-root.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organiza, Feria, Institucion])],
  controllers: [OrganizadoresController, OrganizadoresRootController],
  providers: [OrganizadoresService],
  exports: [OrganizadoresService],
})
export class OrganizadoresModule {}
