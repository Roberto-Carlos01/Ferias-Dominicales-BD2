import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feria } from './feria.entity';
import { FeriasService } from './ferias.service';
import { FeriasController } from './ferias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Feria])],
  controllers: [FeriasController],
  providers: [FeriasService],
  exports: [FeriasService],
})
export class FeriasModule {}
