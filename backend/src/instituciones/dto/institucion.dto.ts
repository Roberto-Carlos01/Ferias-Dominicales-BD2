import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstitucionDto {
  @ApiProperty({ example: '1020304050' })
  @IsString()
  nit: string;

  @ApiProperty({ example: 'Gobierno Autónomo Municipal de La Paz' })
  @IsString()
  razonSocial: string;

  @ApiPropertyOptional({ example: 'contacto@lapaz.bo' })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional({ example: '22650000' })
  @IsOptional()
  @IsString()
  telefono?: string;
}

export class UpdateInstitucionDto {
  @ApiPropertyOptional({ example: 'Gobierno Autónomo Municipal de La Paz' })
  @IsOptional()
  @IsString()
  razonSocial?: string;

  @ApiPropertyOptional({ example: 'contacto@lapaz.bo' })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional({ example: '22650000' })
  @IsOptional()
  @IsString()
  telefono?: string;
}
