import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Feria } from '../ferias/feria.entity';
import { Conforman } from '../participantes/conforman.entity';
import { Ofrece } from '../ofertas/ofrece.entity';
import { Exposicion } from '../exposiciones/exposicion.entity';

@Entity('STAND')
export class Stand {
  @PrimaryColumn({ name: 'NROSTAND' })
  nroStand: number;

  @PrimaryColumn({ name: 'IDFERIA' })
  idFeria: number;

  @Column({ name: 'ANCHO', type: 'decimal', precision: 8, scale: 2, nullable: true })
  ancho: number;

  @Column({ name: 'LARGO', type: 'decimal', precision: 8, scale: 2, nullable: true })
  largo: number;

  @Column({ name: 'UBICACIONINTERNA', nullable: true })
  ubicacionInterna: string;

  @Column({ name: 'ESTADO', nullable: true })
  estado: string;

  @ManyToOne(() => Feria, (f) => f.stands)
  @JoinColumn({ name: 'IDFERIA' })
  feria: Feria;

  @OneToMany(() => Conforman, (c) => c.stand)
  conforman: Conforman[];

  @OneToMany(() => Ofrece, (o) => o.stand)
  ofrece: Ofrece[];

  @OneToMany(() => Exposicion, (e) => e.stand)
  exposiciones: Exposicion[];
}
