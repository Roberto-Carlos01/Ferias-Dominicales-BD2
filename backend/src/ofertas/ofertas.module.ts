import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ofrece } from './ofrece.entity';
import { Stand } from '../stands/stand.entity';
import { Producto } from '../productos/producto.entity';
import { OfertasService } from './ofertas.service';
import { OfertasController } from './ofertas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ofrece, Stand, Producto])],
  controllers: [OfertasController],
  providers: [OfertasService],
  exports: [OfertasService],
})
export class OfertasModule {}
