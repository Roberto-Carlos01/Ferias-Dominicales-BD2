import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Expositor } from '../expositores/expositor.entity';
import { Stand } from '../stands/stand.entity';

@Entity('CONFORMAN')
export class Conforman {
  @PrimaryColumn({ name: 'CIEXPOSITOR' })
  ciExpositor: string;

  @PrimaryColumn({ name: 'NROSTAND' })
  nroStand: number;

  @PrimaryColumn({ name: 'IDFERIA' })
  idFeria: number;

  @Column({ name: 'CARGO', nullable: true })
  cargo: string;

  @ManyToOne(() => Expositor, (e) => e.conforman)
  @JoinColumn({ name: 'CIEXPOSITOR' })
  expositor: Expositor;

  @ManyToOne(() => Stand, (s) => s.conforman)
  @JoinColumn([{ name: 'NROSTAND', referencedColumnName: 'nroStand' }, { name: 'IDFERIA', referencedColumnName: 'idFeria' }])
  stand: Stand;
}
