import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '../../../entities/tag.entity';

export class CategoryDto {
  @ApiProperty({ type: Number, required: false })
  id?: number;

  @ApiProperty({ nullable: true, required: false })
  name?: string;

  @ApiProperty({ type: [Tag], required: false })
  tags?: Tag[];

  @ApiProperty({ type: Number, required: false })
  memoCount?: number;
}