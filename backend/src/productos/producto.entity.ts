import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Ofrece } from '../ofertas/ofrece.entity';

@Entity('PRODUCTO')
export class Producto {
  @PrimaryColumn({ name: 'IDPRODUCTO' })
  idProducto: number;

  @Column({ name: 'NOMBREPROD', nullable: true })
  nombreProd: string;

  @Column({ name: 'PRECIO', type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio: number;

  @Column({ name: 'CATEGORIA', nullable: true })
  categoria: string;

  @Column({ name: 'DESCRIPCIONPROD', nullable: true })
  descripcionProd: string;

  @OneToMany(() => Ofrece, (o) => o.producto)
  ofrece: Ofrece[];
}
