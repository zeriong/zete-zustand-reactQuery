import { PickType } from '@nestjs/swagger';
import { Category } from '../../../../entities/category.entity';

export class DeleteCategoryInput extends PickType(Category, ['id']) {}
