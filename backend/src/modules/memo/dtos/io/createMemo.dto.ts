import { CoreOutput } from '../../../../common/dtos/coreOutput.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Memo } from '../../../../entities/memo.entity';

export class CreateMemoInput extends PickType(Memo, ['cateId', 'title', 'content', 'isImportant', 'tags']) {}

export class CreateMemoOutput extends CoreOutput {
  @ApiProperty({ type: Memo, required: false })
  savedMemo?: Memo;
}
