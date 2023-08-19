import * as Validator from 'class-validator';
import { User } from '../../../entities/user.entity';
import { CoreOutput } from '../../../common/dtos/coreOutput.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserDataInput {
  @ApiProperty({ type: Number })
  @Validator.IsNumber()
  userId;
}

export class UserDataOutput extends CoreOutput {
  @ApiProperty({ type: User, required: false })
  user?: User;
}
