import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizadorDto {
  @ApiProperty({ example: '1020304050' })
  @IsString()
  nit: string;

  @ApiPropertyOptional({ example: 'Organizador principal' })
  @IsOptional()
  @IsString()
  rol?: string;
}

export class UpdateOrganizadorDto {
  @ApiPropertyOptional({ example: 'Coordinador general' })
  @IsOptional()
  @IsString()
  rol?: string;
}

export class QueryOrganizadorDto {
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
  rol?: string;
}

