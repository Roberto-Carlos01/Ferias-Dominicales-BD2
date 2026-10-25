import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Feria } from '../ferias/feria.entity';
import { Stand } from '../stands/stand.entity';

@Entity('EXPOSICION')
export class Exposicion {
  @PrimaryColumn({ name: 'IDEXPOSICION' })
  idExposicion: number;

  @Column({ name: 'TITULOEXPOSICION', nullable: true })
  tituloExposicion: string;

  @Column({ name: 'DESCRIPCION', nullable: true })
  descripcion: string;

  @Column({ name: 'IDFERIA', nullable: true })
  idFeria: number;

  @Column({ name: 'NROSTAND', nullable: true })
  nroStand: number;

  @ManyToOne(() => Feria, (f) => f.exposiciones)
  @JoinColumn({ name: 'IDFERIA' })
  feria: Feria;

  @ManyToOne(() => Stand, (s) => s.exposiciones)
  @JoinColumn([{ name: 'NROSTAND', referencedColumnName: 'nroStand' }, { name: 'IDFERIA', referencedColumnName: 'idFeria' }])
  stand: Stand;
}
