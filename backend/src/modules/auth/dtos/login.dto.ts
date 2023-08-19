import * as Validator from 'class-validator';
import { User } from '../../../entities/user.entity';
import { CoreOutput } from '../../../common/dtos/coreOutput.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class LoginInput extends PickType(User, ['email', 'password']) {}

export class LoginOutput extends CoreOutput {
  @ApiProperty({ required: false, type: User })
  user?: User;

  @ApiProperty({ required: false, nullable: true })
  @Validator.IsString()
  accessToken?: string;
}
