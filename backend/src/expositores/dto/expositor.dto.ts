import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpositorDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  ciExpositor: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Perez' })
  @IsOptional()
  @IsString()
  paterno?: string;

  @ApiPropertyOptional({ example: 'Lopez' })
  @IsOptional()
  @IsString()
  materno?: string;

  @ApiPropertyOptional({ example: 'juan.perez@email.com' })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional({ example: '71234567' })
  @IsOptional()
  @IsString()
  telefono?: string;
}

export class UpdateExpositorDto {
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Perez' })
  @IsOptional()
  @IsString()
  paterno?: string;

  @ApiPropertyOptional({ example: 'Lopez' })
  @IsOptional()
  @IsString()
  materno?: string;

  @ApiPropertyOptional({ example: 'juan.perez@email.com' })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional({ example: '71234567' })
  @IsOptional()
  @IsString()
  telefono?: string;
}

export class QueryExpositorDto {
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

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  multiples?: any;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  idFeria?: any;
}

