import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Feria } from '../ferias/feria.entity';

@Entity('UBICACION')
export class Ubicacion {
  @PrimaryColumn({ name: 'IDUBICACION' })
  idUbicacion: number;

  @Column({ name: 'NOMBRE', nullable: true })
  nombre: string;

  @Column({ name: 'CIUDAD', nullable: true })
  ciudad: string;

  @Column({ name: 'ZONA', nullable: true })
  zona: string;

  @Column({ name: 'CAPACIDAD', nullable: true })
  capacidad: number;

  @Column({ name: 'REFERENCIA', nullable: true })
  referencia: string;

  @OneToMany(() => Feria, (feria) => feria.ubicacion)
  ferias: Feria[];
}
