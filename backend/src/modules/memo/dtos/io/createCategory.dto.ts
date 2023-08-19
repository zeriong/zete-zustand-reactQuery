import { ApiProperty, PickType } from '@nestjs/swagger';
import { CoreOutput } from '../../../../common/dtos/coreOutput.dto';
import { Category } from '../../../../entities/category.entity';

export class CreateCategoryInput extends PickType(Category, ['name']) {}

export class CreateCategoryOutput extends CoreOutput {
  @ApiProperty({ type: Category, required: false })
  savedCate?: Category;
}
