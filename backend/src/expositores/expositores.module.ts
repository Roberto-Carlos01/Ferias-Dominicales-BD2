import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expositor } from './expositor.entity';
import { ExpositoresService } from './expositores.service';
import { ExpositoresController } from './expositores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Expositor])],
  controllers: [ExpositoresController],
  providers: [ExpositoresService],
  exports: [ExpositoresService],
})
export class ExpositoresModule {}
