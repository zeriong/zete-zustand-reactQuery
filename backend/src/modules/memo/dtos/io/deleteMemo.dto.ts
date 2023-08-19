import { PickType } from '@nestjs/swagger';
import { Memo } from '../../../../entities/memo.entity';

export class DeleteMemoInput extends PickType(Memo, ['id']) {}
