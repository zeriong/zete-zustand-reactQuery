import { PickType } from '@nestjs/swagger';
import { Category } from '../../../../entities/category.entity';

export class UpdateCategoryInput extends PickType(Category, ['id', 'name']) {}
