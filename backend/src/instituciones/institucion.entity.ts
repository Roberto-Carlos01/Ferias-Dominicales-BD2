import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Organiza } from '../organizadores/organiza.entity';
import { Patrocina } from '../patrocinadores/patrocina.entity';

@Entity('INSTITUCION')
export class Institucion {
  @PrimaryColumn({ name: 'NIT' })
  nit: string;

  @Column({ name: 'RAZONSOCIAL', nullable: true })
  razonSocial: string;

  @Column({ name: 'CORREO', nullable: true })
  correo: string;

  @Column({ name: 'TELEFONO', nullable: true })
  telefono: string;

  @OneToMany(() => Organiza, (o) => o.institucion)
  organiza: Organiza[];

  @OneToMany(() => Patrocina, (p) => p.institucion)
  patrocina: Patrocina[];
}
