import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  idProducto?: number;

  @ApiProperty({ example: 'Artesanía de Cerámica Tiwanaku' })
  @IsString()
  nombreProd: string;

  @ApiPropertyOptional({ example: 45.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @ApiPropertyOptional({ example: 'Artesanía' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ example: 'Jarrón decorativo hecho a mano' })
  @IsOptional()
  @IsString()
  descripcionProd?: string;
}

export class UpdateProductoDto {
  @ApiPropertyOptional({ example: 'Artesanía de Cerámica Tiwanaku' })
  @IsOptional()
  @IsString()
  nombreProd?: string;

  @ApiPropertyOptional({ example: 45.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @ApiPropertyOptional({ example: 'Artesanía' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ example: 'Jarrón decorativo hecho a mano' })
  @IsOptional()
  @IsString()
  descripcionProd?: string;
}

export class QueryProductoDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  idFeria?: any;
}

