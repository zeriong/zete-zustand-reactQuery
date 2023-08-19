import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import { Column } from 'typeorm';
import * as Validator from 'class-validator';

export class UpdateAccountInput extends PickType(User, ['email', 'name', 'mobile']) {
  @ApiProperty({ required: false })
  @Column({ select: false, length: 64 }) //select할 수 없게 만듦
  @Validator.IsString()
  @Validator.IsOptional()
  password?: string;
}
