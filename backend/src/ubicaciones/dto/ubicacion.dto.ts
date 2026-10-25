import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUbicacionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  idUbicacion?: number;

  @ApiProperty({ example: 'Campo Ferial Chuquiago Marka' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'La Paz' })
  @IsString()
  ciudad: string;

  @ApiProperty({ example: 'Bajo Següencoma' })
  @IsString()
  zona: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacidad?: number;

  @ApiPropertyOptional({ example: 'Av. Costanera, frente al puente' })
  @IsOptional()
  @IsString()
  referencia?: string;
}

export class UpdateUbicacionDto {
  @ApiPropertyOptional({ example: 'Campo Ferial Chuquiago Marka' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'La Paz' })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional({ example: 'Bajo Següencoma' })
  @IsOptional()
  @IsString()
  zona?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  capacidad?: number;

  @ApiPropertyOptional({ example: 'Av. Costanera' })
  @IsOptional()
  @IsString()
  referencia?: string;
}
