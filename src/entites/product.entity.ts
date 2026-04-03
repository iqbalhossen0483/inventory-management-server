import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { UserEntity } from './user.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
}

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column({ type: 'int', default: 0 })
  sale_price: number;

  @Column({ type: 'int', default: 0 })
  general_price: number;

  @Column({ type: 'int', default: 0 })
  purchase_price: number;

  @Column({ type: 'int', default: 0 })
  stock_quantity: number;

  @Column({ type: 'int', default: 0 })
  minimum_stock_threshold: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  created_by: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
}
