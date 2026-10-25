import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Expositor } from '../expositores/expositor.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  USUARIO = 'USUARIO',
}

export enum UserStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

@Entity('USUARIO')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'IDUSUARIO' })
  idUsuario: number;

  @Column({ name: 'CORREO', unique: true })
  correo: string;

  @Column({ name: 'PASSWORDHASH' })
  passwordHash: string;

  @Column({ name: 'ROL', type: 'enum', enum: UserRole, default: UserRole.USUARIO })
  rol: UserRole;

  @Column({ name: 'ESTADO', type: 'enum', enum: UserStatus, default: UserStatus.ACTIVO })
  estado: UserStatus;

  @Column({ name: 'CIEXPOSITOR', nullable: true })
  ciExpositor: string | null;

  @CreateDateColumn({ name: 'FECHACREACION' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'FECHAACTUALIZACION' })
  fechaActualizacion: Date;

  @ManyToOne(() => Expositor, (e) => e.usuarios, { nullable: true, eager: false })
  @JoinColumn({ name: 'CIEXPOSITOR' })
  expositor: Expositor | null;
}
