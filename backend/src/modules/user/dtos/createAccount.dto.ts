import { PickType } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';

export class CreateAccountInput extends PickType(User, ['email', 'password', 'name', 'mobile']) {}
