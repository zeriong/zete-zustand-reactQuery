import * as Validator from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CoreOutput } from '../../../common/dtos/coreOutput.dto';

export class CreateCompletionDto {
  @ApiProperty()
  @Validator.IsString()
  content: string;
}

export class CreateCompletionOutputDto extends CoreOutput {
  @ApiProperty({ required: false })
  gptResponse?: string;

  @ApiProperty({ type: Number, required: false })
  usableCount?: number;
}
