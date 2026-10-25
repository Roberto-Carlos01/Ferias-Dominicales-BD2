import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conforman } from './conforman.entity';
import { Feria } from '../ferias/feria.entity';
import { Expositor } from '../expositores/expositor.entity';
import { Stand } from '../stands/stand.entity';
import { ParticipantesService } from './participantes.service';
import { ParticipantesController } from './participantes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Conforman, Feria, Expositor, Stand])],
  controllers: [ParticipantesController],
  providers: [ParticipantesService],
  exports: [ParticipantesService],
})
export class ParticipantesModule {}
