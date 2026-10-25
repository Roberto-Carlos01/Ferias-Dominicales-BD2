import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeriaDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  idFeria?: number;

  @ApiProperty({ example: 'Feria Dominical de las Culturas 2026' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Espacio cultural dominical en El Prado' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: '2026-05-10' })
  @IsOptional()
  @IsDateString()
  fechaIni?: string;

  @ApiPropertyOptional({ example: '2026-05-10' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ example: '09:00:00' })
  @IsOptional()
  @IsString()
  horaInicio?: string;

  @ApiPropertyOptional({ example: '15:00:00' })
  @IsOptional()
  @IsString()
  horaFin?: string;

  @ApiPropertyOptional({ example: 'ACTIVA' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ example: 'CULTURAL' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  idUbicacion?: number;
}

export class UpdateFeriaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaIni?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horaInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horaFin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  idUbicacion?: number;
}

export class QueryFeriaDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
