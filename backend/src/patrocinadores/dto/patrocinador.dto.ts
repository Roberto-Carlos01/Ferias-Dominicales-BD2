import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatrocinadorDto {
  @ApiProperty({ example: '1020304050' })
  @IsString()
  nit: string;

  @ApiPropertyOptional({ example: 'ECONOMICO' })
  @IsOptional()
  @IsString()
  tipoApoyo?: string;

  @ApiPropertyOptional({ example: 5000.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;

  @ApiPropertyOptional({ example: 'Apoyo para infraestructura de stands' })
  @IsOptional()
  @IsString()
  detalles?: string;
}

export class UpdatePatrocinadorDto {
  @ApiPropertyOptional({ example: 'LOGISTICO' })
  @IsOptional()
  @IsString()
  tipoApoyo?: string;

  @ApiPropertyOptional({ example: 7500.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;

  @ApiPropertyOptional({ example: 'Provisión de mobiliario' })
  @IsOptional()
  @IsString()
  detalles?: string;
}

export class QueryPatrocinadorDto {
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

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  idFeria?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipoApoyo?: string;
}

