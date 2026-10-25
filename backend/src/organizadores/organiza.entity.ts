import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Feria } from '../ferias/feria.entity';
import { Institucion } from '../instituciones/institucion.entity';

@Entity('ORGANIZA')
export class Organiza {
  @PrimaryColumn({ name: 'IDFERIA' })
  idFeria: number;

  @PrimaryColumn({ name: 'NIT' })
  nit: string;

  @Column({ name: 'ROL', nullable: true })
  rol: string;

  @ManyToOne(() => Feria, (f) => f.organizadores)
  @JoinColumn({ name: 'IDFERIA' })
  feria: Feria;

  @ManyToOne(() => Institucion, (i) => i.organiza)
  @JoinColumn({ name: 'NIT' })
  institucion: Institucion;
}
