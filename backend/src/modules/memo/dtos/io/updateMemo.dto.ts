import { ApiProperty, PickType } from '@nestjs/swagger';
import { Memo } from '../../../../entities/memo.entity';
import { CoreOutput } from '../../../../common/dtos/coreOutput.dto';

export class UpdateMemoInput extends PickType(Memo, ['id', 'cateId', 'title', 'content', 'isImportant', 'tags']) {}

export class UpdateMemoOutput extends CoreOutput {
  @ApiProperty({ type: Memo, required: false })
  savedMemo?: Memo;
}
