import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Ubicacion } from '../ubicaciones/ubicacion.entity';
import { Stand } from '../stands/stand.entity';
import { Exposicion } from '../exposiciones/exposicion.entity';
import { Organiza } from '../organizadores/organiza.entity';
import { Patrocina } from '../patrocinadores/patrocina.entity';

@Entity('FERIA')
export class Feria {
  @PrimaryColumn({ name: 'IDFERIA' })
  idFeria: number;

  @Column({ name: 'NOMBRE', nullable: true })
  nombre: string;

  @Column({ name: 'DESCRIPCION', nullable: true })
  descripcion: string;

  @Column({ name: 'FECHA_INI', type: 'date', nullable: true })
  fechaIni: string;

  @Column({ name: 'FECHA_FIN', type: 'date', nullable: true })
  fechaFin: string;

  @Column({ name: 'HORA_INICIO', nullable: true })
  horaInicio: string;

  @Column({ name: 'HORA_FIN', nullable: true })
  horaFin: string;

  @Column({ name: 'ESTADO', nullable: true })
  estado: string;

  @Column({ name: 'TIPO', nullable: true })
  tipo: string;

  @Column({ name: 'IDUBICACION', nullable: true })
  idUbicacion: number;

  @ManyToOne(() => Ubicacion, (u) => u.ferias, { eager: false })
  @JoinColumn({ name: 'IDUBICACION' })
  ubicacion: Ubicacion;

  @OneToMany(() => Stand, (s) => s.feria)
  stands: Stand[];

  @OneToMany(() => Exposicion, (e) => e.feria)
  exposiciones: Exposicion[];

  @OneToMany(() => Organiza, (o) => o.feria)
  organizadores: Organiza[];

  @OneToMany(() => Patrocina, (p) => p.feria)
  patrocinadores: Patrocina[];
}
