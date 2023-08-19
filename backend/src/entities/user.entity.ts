import { coreEntity } from '../common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from './category.entity';
import { Memo } from './memo.entity';
import { Tag } from './tag.entity';
import * as Validator from 'class-validator';

@Entity({ name: 'user' })
export class User extends coreEntity {
  /** email */
  @ApiProperty()
  @Column({ unique: true, length: 64, comment: '유저 이메일' })
  @Validator.IsEmail({}, { message: '이메일을 입력해 주시기 바랍니다.' })
  @Validator.Length(6, 64, { message: '이메일을 입력해 주시기 바랍니다.' })
  email: string;

  /** password */
  @ApiProperty()
  @Column({ select: false, length: 64 }) //select할 수 없게 만듦
  @Validator.IsString()
  @Validator.Length(8, 64, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  /** name */
  @ApiProperty()
  @Column({ length: 32, comment: '유저 이름' })
  @Validator.IsString()
  @Validator.Length(2, 32, { message: '이름은 최소 2자 이상이어야 합니다.' })
  name: string;

  /** mobile */
  @ApiProperty()
  @Column({ length: 13, comment: '휴대폰 변호' })
  @Validator.IsString()
  @Validator.Length(13, 13, { message: '휴대폰 번호를 입력해주세요.' })
  mobile: string;

  /** refreshToken */
  @ApiProperty({ required: false })
  @Column({ type: 'tinytext', nullable: true })
  refreshToken?: string;

  /** gpt usable count */
  @ApiProperty({ type: Number, required: false })
  @Column({ type: 'tinyint', default: 0 })
  gptUsableCount?: number;

  /** gpt usable count reset At */
  @ApiProperty({ type: Date, required: false })
  @Column({ type: 'date', nullable: true })
  gptUsableCountResetAt?: Date;

  @ApiProperty({ type: Category, isArray: true, required: false })
  @OneToMany(() => Category, (inverse) => inverse.user, { cascade: true })
  cates?: Category[];

  @ApiProperty({ type: Memo, isArray: true, required: false })
  @OneToMany(() => Memo, (inverse) => inverse.user, { cascade: true })
  memos?: Memo[];

  @ApiProperty({ type: Tag, isArray: true, required: false })
  @OneToMany(() => Tag, (inverse) => inverse.user, { cascade: true })
  tags?: Tag[];
}
