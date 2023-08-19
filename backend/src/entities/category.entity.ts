import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Memo } from './memo.entity';
import { Tag } from './tag.entity';
import * as Validator from 'class-validator';

@Entity({ name: 'category' })
export class Category {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  @Validator.IsNumber()
  id: number;

  @ApiProperty({ required: false })
  @Column({ type: 'tinytext' }) //tinytext: 	255
  @Validator.IsOptional()
  @Validator.IsString()
  @Validator.MaxLength(255, { message: '카테고리 명칭은 최대 255자까지 지정 가능합니다.' })
  name?: string;

  @ManyToOne(() => User, (inverse) => inverse.cates, { onDelete: 'CASCADE' })
  user?: User;
  @ApiProperty({ type: Number })
  @RelationId((category: Category) => category.user)
  userId?: number;

  @ApiProperty({ type: Memo, isArray: true, required: false })
  @OneToMany(() => Memo, (inverse) => inverse.cate, { cascade: true })
  memos?: Memo[];

  @ApiProperty({ type: Tag, isArray: true, required: false })
  @OneToMany(() => Tag, (inverse) => inverse.cate, { cascade: true })
  tags?: Tag[];
}
