import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessPayload } from './jwt.interfaces';
import { User } from '../../../entities/user.entity';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService, private readonly usersService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // accessToken 헤더에서 받아옴
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_TOKEN_PRIVATE_KEY'),
    });
  }
  async validate(payload: AccessPayload): Promise<User | null> {
    let user = null;
    try {
      user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException();
    } catch (e) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
