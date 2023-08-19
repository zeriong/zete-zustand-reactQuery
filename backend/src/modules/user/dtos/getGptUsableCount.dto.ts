import { ApiProperty } from '@nestjs/swagger';
import * as Validator from 'class-validator';
import { CoreOutput } from '../../../common/dtos/coreOutput.dto';

export class GetGptUsableCountOutput extends CoreOutput {
  @ApiProperty({ type: Number, required: false })
  count?: number;
}
