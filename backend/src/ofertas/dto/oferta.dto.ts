import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfertaDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  idProducto: number;

  @ApiPropertyOptional({ example: 'unidad' })
  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  stock: number;
}

export class UpdateOfertaDto {
  @ApiPropertyOptional({ example: 'unidad' })
  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
