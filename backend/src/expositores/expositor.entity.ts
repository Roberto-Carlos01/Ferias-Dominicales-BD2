import { Entity, PrimaryColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Conforman } from '../participantes/conforman.entity';
import { Usuario } from '../users/usuario.entity';

@Entity('EXPOSITOR')
export class Expositor {
  @PrimaryColumn({ name: 'CIEXPOSITOR' })
  ciExpositor: string;

  @Column({ name: 'NOMBRE', nullable: true })
  nombre: string;

  @Column({ name: 'PATERNO', nullable: true })
  paterno: string;

  @Column({ name: 'MATERNO', nullable: true })
  materno: string;

  @Column({ name: 'CORREO', nullable: true })
  correo: string;

  @Column({ name: 'TELEFONO', nullable: true })
  telefono: string;

  @OneToMany(() => Conforman, (c) => c.expositor)
  conforman: Conforman[];

  @OneToMany(() => Usuario, (u) => u.expositor)
  usuarios: Usuario[];
}
