import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exposicion } from './exposicion.entity';
import { Stand } from '../stands/stand.entity';
import { ExposicionesService } from './exposiciones.service';
import { ExposicionesController } from './exposiciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exposicion, Stand])],
  controllers: [ExposicionesController],
  providers: [ExposicionesService],
  exports: [ExposicionesService],
})
export class ExposicionesModule {}
