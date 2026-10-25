import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParticipanteDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  ciExpositor: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  nroStand: number;

  @ApiPropertyOptional({ example: 'Responsable' })
  @IsOptional()
  @IsString()
  cargo?: string;
}

export class UpdateParticipanteDto {
  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  nroStand?: number;

  @ApiPropertyOptional({ example: 'Encargado de Ventas' })
  @IsOptional()
  @IsString()
  cargo?: string;
}
