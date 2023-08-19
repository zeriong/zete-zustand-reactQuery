import { ApiProperty, PickType } from '@nestjs/swagger';
import { Memo } from '../../../../entities/memo.entity';
import { CoreOutput } from '../../../../common/dtos/coreOutput.dto';

export class GetMemoInput extends PickType(Memo, ['id']) {}

export class GetMemoOutput extends CoreOutput {
  @ApiProperty({ type: Memo, required: false })
  memo?: Memo;
}
