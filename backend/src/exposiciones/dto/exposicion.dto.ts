import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExposicionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  idExposicion?: number;

  @ApiProperty({ example: 'Demostración de Robótica e IA' })
  @IsString()
  tituloExposicion: string;

  @ApiPropertyOptional({ example: 'Presentación interactiva de prototipos' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  idFeria: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  nroStand: number;
}

export class UpdateExposicionDto {
  @ApiPropertyOptional({ example: 'Demostración de Robótica e IA' })
  @IsOptional()
  @IsString()
  tituloExposicion?: string;

  @ApiPropertyOptional({ example: 'Presentación interactiva' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  idFeria?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  nroStand?: number;
}
