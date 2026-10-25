import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../usuario.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'El correo debe ser válido' })
  correo: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USUARIO })
  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.ACTIVO })
  @IsOptional()
  @IsEnum(UserStatus)
  estado?: UserStatus;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  ciExpositor?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'usuario@email.com' })
  @IsOptional()
  @IsEmail()
  correo?: string;

  @ApiPropertyOptional({ example: 'NewSecret123!' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  estado?: UserStatus;

  @ApiPropertyOptional({ example: '123456', nullable: true })
  @IsOptional()
  ciExpositor?: string | null;
}

export class LinkExpositorDto {
  @ApiPropertyOptional({ example: '123456', nullable: true })
  ciExpositor: string | null;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  estado: UserStatus;
}

export class UpdateRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  rol: UserRole;
}

export class ConvertirExpositorDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  ciExpositor: string;

  @ApiProperty({ example: 'Carlos' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Mamani' })
  @IsOptional()
  @IsString()
  paterno?: string;

  @ApiPropertyOptional({ example: 'Quispe' })
  @IsOptional()
  @IsString()
  materno?: string;

  @ApiPropertyOptional({ example: '71234567' })
  @IsOptional()
  @IsString()
  telefono?: string;
}

export class QueryUserDto {
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

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  sinExpositor?: any;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  soloExpositores?: any;
}

