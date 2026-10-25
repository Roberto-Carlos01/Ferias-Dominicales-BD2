import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Feria } from '../ferias/feria.entity';
import { Institucion } from '../instituciones/institucion.entity';

@Entity('PATROCINA')
export class Patrocina {
  @PrimaryColumn({ name: 'IDFERIA' })
  idFeria: number;

  @PrimaryColumn({ name: 'NIT' })
  nit: string;

  @Column({ name: 'TIPO_APOYO', nullable: true })
  tipoApoyo: string;

  @Column({ name: 'CANTIDAD', type: 'decimal', precision: 10, scale: 2, nullable: true })
  cantidad: number;

  @Column({ name: 'DETALLES', nullable: true })
  detalles: string;

  @ManyToOne(() => Feria, (f) => f.patrocinadores)
  @JoinColumn({ name: 'IDFERIA' })
  feria: Feria;

  @ManyToOne(() => Institucion, (i) => i.patrocina)
  @JoinColumn({ name: 'NIT' })
  institucion: Institucion;
}
