import { CoreOutput } from '../../../../common/dtos/coreOutput.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Memo } from '../../../../entities/memo.entity';

export class ChangeImportantInput extends PickType(Memo, ['id']) {}

export class ChangeImportantOutput extends CoreOutput {
  @ApiProperty({ type: Number, required: false })
  totalImportantCount?: number;
}
