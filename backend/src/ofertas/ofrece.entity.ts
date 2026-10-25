import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Stand } from '../stands/stand.entity';
import { Producto } from '../productos/producto.entity';

@Entity('OFRECE')
export class Ofrece {
  @PrimaryColumn({ name: 'IDFERIA' })
  idFeria: number;

  @PrimaryColumn({ name: 'NROSTAND' })
  nroStand: number;

  @PrimaryColumn({ name: 'IDPRODUCTO' })
  idProducto: number;

  @Column({ name: 'UNIDADMEDIDA', nullable: true })
  unidadMedida: string;

  @Column({ name: 'STOCK', nullable: true })
  stock: number;

  @ManyToOne(() => Stand, (s) => s.ofrece)
  @JoinColumn([{ name: 'NROSTAND', referencedColumnName: 'nroStand' }, { name: 'IDFERIA', referencedColumnName: 'idFeria' }])
  stand: Stand;

  @ManyToOne(() => Producto, (p) => p.ofrece)
  @JoinColumn({ name: 'IDPRODUCTO' })
  producto: Producto;
}
