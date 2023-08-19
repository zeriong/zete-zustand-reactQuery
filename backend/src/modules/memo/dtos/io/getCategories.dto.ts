import { CoreOutput } from '../../../../common/dtos/coreOutput.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryDto } from '../category.dto';

export class GetCategoriesOutput extends CoreOutput {
  @ApiProperty({ type: Number, required: false })
  totalMemoCount?: number;

  @ApiProperty({ type: Number, required: false })
  importantMemoCount?: number;

  @ApiProperty({ type: CategoryDto, isArray: true, required: false })
  list?: CategoryDto[];
}
