import { IsOptional, IsInt, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParamFeriaIdDto {
  @ApiProperty({ description: 'ID de la feria' })
  @Type(() => Number)
  @IsInt()
  id: number;
}

export class TestAsignarExpositorDto {
  @ApiProperty({ description: 'ID de la feria', example: 1 })
  @Type(() => Number)
  @IsInt()
  idFeria: number;

  @ApiProperty({ description: 'Número de stand a ocupar', example: 2 })
  @Type(() => Number)
  @IsInt()
  nroStand: number;

  @ApiProperty({ description: 'CI del expositor a asignar', example: '7401894P' })
  @IsString()
  ciExpositor: string;

  @ApiPropertyOptional({ description: 'Cargo o rol del expositor', example: 'Encargado de Stand' })
  @IsOptional()
  @IsString()
  cargo?: string;
}

export class TestStockNegativoDto {
  @ApiProperty({ description: 'ID de la feria', example: 1 })
  @Type(() => Number)
  @IsInt()
  idFeria: number;

  @ApiProperty({ description: 'Número de stand', example: 1 })
  @Type(() => Number)
  @IsInt()
  nroStand: number;

  @ApiProperty({ description: 'ID del producto', example: 1 })
  @Type(() => Number)
  @IsInt()
  idProducto: number;

  @ApiProperty({ description: 'Cantidad de stock a registrar o actualizar (puede ser negativo para probar trigger)', example: -5 })
  @Type(() => Number)
  @IsInt()
  stock: number;

  @ApiPropertyOptional({ description: 'Unidad de medida', example: 'Unidad' })
  @IsOptional()
  @IsString()
  unidadMedida?: string;
}

export class TestFechasFeriaDto {
  @ApiProperty({ description: 'Nombre de la feria', example: 'Feria de Prueba Trigger' })
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Fecha de inicio (YYYY-MM-DD)', example: '2026-12-25' })
  @IsDateString()
  fechaIni: string;

  @ApiProperty({ description: 'Fecha de fin (YYYY-MM-DD, poner anterior para probar trigger)', example: '2026-12-10' })
  @IsDateString()
  fechaFin: string;

  @ApiPropertyOptional({ description: 'Descripción', example: 'Prueba de validación de fechas' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'ID de ubicación', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idUbicacion?: number;
}
