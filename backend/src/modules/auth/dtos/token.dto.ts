import { CoreOutput } from '../../../common/dtos/coreOutput.dto';
import * as Validator from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenOutput extends CoreOutput {
  @ApiProperty({ required: false, nullable: true })
  @Validator.IsString()
  accessToken?: string;
}
