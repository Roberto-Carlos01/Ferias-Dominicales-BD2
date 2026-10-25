import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStandDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  nroStand?: number;

  @ApiPropertyOptional({ example: 3.5 })
  @IsOptional()
  @IsNumber()
  ancho?: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  largo?: number;

  @ApiPropertyOptional({ example: 'Sector Artesanías A-12' })
  @IsOptional()
  @IsString()
  ubicacionInterna?: string;

  @ApiPropertyOptional({ example: 'DISPONIBLE' })
  @IsOptional()
  @IsString()
  estado?: string;
}

export class UpdateStandDto {
  @ApiPropertyOptional({ example: 3.5 })
  @IsOptional()
  @IsNumber()
  ancho?: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  largo?: number;

  @ApiPropertyOptional({ example: 'Sector Artesanías A-12' })
  @IsOptional()
  @IsString()
  ubicacionInterna?: string;

  @ApiPropertyOptional({ example: 'OCUPADO' })
  @IsOptional()
  @IsString()
  estado?: string;
}
