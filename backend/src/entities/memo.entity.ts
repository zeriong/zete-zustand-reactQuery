import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tag } from './tag.entity';
import { User } from './user.entity';
import { coreEntity } from '../common/entities/core.entity';
import { Category } from './category.entity';
import * as Validator from 'class-validator';

@Entity({ name: 'memo' })
export class Memo extends coreEntity {
  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255 })
  @Validator.IsOptional()
  @Validator.IsString()
  @Validator.MaxLength(255, { message: '제목명은 최대 255자까지 입력 가능합니다.' })
  title?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text' }) //text: 	65,535
  @Validator.IsOptional()
  @Validator.IsString()
  @Validator.MaxLength(65535, { message: '최대 65,535자까지 메모 가능합니다.' })
  content?: string;

  @ApiProperty({ type: Boolean, required: false })
  @Column({ type: 'boolean' })
  @Validator.IsOptional()
  @Validator.IsBoolean()
  isImportant?: boolean;

  @ManyToOne(() => User, (inverse) => inverse.memos, { onDelete: 'CASCADE' })
  user?: User;
  @ApiProperty({ type: Number, required: false })
  @RelationId((memo: Memo) => memo.user)
  userId?: number;

  @ManyToOne(() => Category, (inverse) => inverse.memos, { onDelete: 'CASCADE' })
  cate?: Category;
  @ApiProperty({ type: Number, required: false })
  @RelationId((memo: Memo) => memo.cate)
  @Validator.IsOptional()
  @Validator.IsNumber()
  cateId?: number;

  @ApiProperty({ type: Tag, isArray: true, required: false })
  @OneToMany(() => Tag, (inverse) => inverse.memo, { cascade: true })
  @Validator.IsOptional()
  @Validator.IsArray({ message: '잘못된 태그형식입니다.' })
  tags?: Tag[];
}
