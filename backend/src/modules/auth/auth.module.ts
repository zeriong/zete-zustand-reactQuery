import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './jwt/jwtRefresh.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY,
        signOptions: {
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
