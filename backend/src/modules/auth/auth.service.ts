import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request, Response } from 'express';

import { User } from '../../entities/user.entity';

import { UserService } from '../user/user.service';

import { AccessPayload, RefreshPayload } from './jwt/jwt.interfaces';

import { LoginInput, LoginOutput } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { AccessTokenOutput } from './dtos/token.dto';
import { CoreOutput } from '../../common/dtos/coreOutput.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private userService: UserService, private jwtService: JwtService, private readonly config: ConfigService) {}

  /**
   * 로그인
   * @description 컨트롤러 주입 용도
   * TODO: 서비스시 쿠키 설정
   * */
  async login({ email, password }: LoginInput, response: Response): Promise<LoginOutput> {
    try {
      // 계정, 비밀번호 검증
      const user: User = await this.userService.validateUser(email, password);
      // 계정, 비밀번호 검증 성공
      if (user !== null) {
        // jwt 토큰 발급
        const accessPayload: AccessPayload = { sub: user.id };
        const refreshPayload: RefreshPayload = { sub: user.id };

        // jwt 토큰 생성
        const [accessToken, refreshToken] = [
          await this.jwtService.signAsync(accessPayload),
          await this.jwtService.signAsync(refreshPayload, {
            secret: this.config.get('JWT_REFRESH_TOKEN_PRIVATE_KEY'),
            expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION'),
          }),
        ];

        // refreshToken 쿠키 저장
        response.cookie('rt', refreshToken, {
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 1개월 (setMaxAge)
        });
        // refreshToken 디비 저장
        await this.userService.update(user.id, { refreshToken });

        return { success: true, accessToken };
      }
      return { success: false, error: '이메일 혹은 비밀번호가 잘못되었습니다.' };
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '로그인에 실패하였습니다.' };
  }

  /**
   * accessToken 재발급
   * @description 컨트롤러 주입 용도
   * @return 발급된 accessToken 포함
   * */
  async refreshToken(user: User, req: Request): Promise<AccessTokenOutput> {
    try {
      // refreshToken 쿠키에서 받아오기
      const refreshToken = req.cookies['rt'];
      // accessToken 발행 조건 검사
      if (!refreshToken || !user || !user.refreshToken || refreshToken != user.refreshToken) {
        // console.log('refreshToken: 검증 불일치 오류');
        new UnauthorizedException();
      }
      // accessToken 토큰 재생성
      const accessPayload: AccessPayload = { sub: user.id };
      const accessToken = await this.jwtService.signAsync(accessPayload);

      return { success: true, accessToken };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  /**
   * 로그아웃
   * @description 컨트롤러 주입 용도
   * */
  async logout(user: User, res: Response): Promise<CoreOutput> {
    try {
      // refreshToken 쿠키 삭제 (maxAge = 쿠키유지기한)
      res.cookie('rt', '', { maxAge: 0 });
      // refreshToken DB에서 삭제
      await this.userService.update(user.id, { refreshToken: null });
      return { success: true };
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '잘못된 접근입니다.' };
  }
}
