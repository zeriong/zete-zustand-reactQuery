import { Entity, Column, ManyToOne, RelationId, PrimaryGeneratedColumn } from 'typeorm';
import { Memo } from './memo.entity';
import { Category } from './category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import * as Validator from 'class-validator';

@Entity({ name: 'tag' })
export class Tag {
  @ApiProperty({ type: Number, required: false })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  @Validator.IsOptional()
  @Validator.IsNumber()
  id?: number;

  @ApiProperty({ required: false })
  @Column()
  @Validator.IsOptional()
  @Validator.IsString()
  name?: string;

  @ManyToOne(() => User, (inverse) => inverse.tags, { onDelete: 'CASCADE' })
  user: User;
  @ApiProperty({ type: Number, required: false })
  @RelationId((tag: Tag) => tag.user)
  userId?: number;

  @ManyToOne(() => Memo, (inverse) => inverse.tags, { onDelete: 'CASCADE' })
  memo: Memo;
  @ApiProperty({ type: Number, required: false })
  @RelationId((tag: Tag) => tag.memo)
  memoId?: number;

  @ManyToOne(() => Category, (inverse) => inverse.tags, { onDelete: 'CASCADE' })
  cate: Category;
  @ApiProperty({ type: Number, nullable: true, required: false })
  @RelationId((tag: Tag) => tag.cate)
  cateId?: number;
}
