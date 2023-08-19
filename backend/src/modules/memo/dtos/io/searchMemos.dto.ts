import { CoreOutput } from '../../../../common/dtos/coreOutput.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Memo } from '../../../../entities/memo.entity';
import * as Validator from 'class-validator';

export class SearchMemosInput {
  @ApiProperty({ required: false })
  @Validator.IsOptional()
  @Validator.IsString()
  @Validator.MaxLength(255, { message: '제목명은 최대 255자까지 입력 가능합니다.' })
  search?: string;

  @ApiProperty({ type: Number, default: 0 })
  @Validator.IsOptional()
  @Validator.IsNumber()
  offset?: number;

  @ApiProperty({ type: Number, default: 15 })
  @Validator.IsOptional()
  @Validator.IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @Validator.IsOptional()
  @Validator.IsString()
  cate?: string;

  @ApiProperty({ required: false })
  @Validator.IsOptional()
  @Validator.IsString()
  tag?: string;
}

export class SearchMemosOutput extends CoreOutput {
  @ApiProperty({ type: [Memo], required: false })
  list?: Memo[];

  @ApiProperty({ type: Number, required: false })
  totalCount?: number;

  @ApiProperty({ type: Number, required: false })
  importantMemoCount?: number;
}
