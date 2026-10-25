import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stand } from './stand.entity';
import { Feria } from '../ferias/feria.entity';
import { StandsService } from './stands.service';
import { StandsController } from './stands.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stand, Feria])],
  controllers: [StandsController],
  providers: [StandsService],
  exports: [StandsService],
})
export class StandsModule {}
