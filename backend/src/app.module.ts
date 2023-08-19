import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { OpenAiModule } from './modules/openAi/openAi.module';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';
import { Memo } from './entities/memo.entity';
import { UserModule } from './modules/user/user.module';
import { MemoModule } from './modules/memo/memo.module';

@Module({
  imports: [
    // 콘피그 설정
    ConfigModule.forRoot({
      // cache: true,
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env.prod',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_NAME: Joi.string(),
        JWT_ACCESS_TOKEN_PRIVATE_KEY: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
        JWT_REFRESH_TOKEN_PRIVATE_KEY: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
        AWS_KEY: Joi.string(),
        AWS_SECRET: Joi.string(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'production',
      //logging: process.env.NODE_ENV !== 'production',
      logging: false,
      entities: [User, Category, Memo, Tag],
    }),
    /*
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api*'],
    }),
    */
    UserModule,
    AuthModule,
    MemoModule,
    OpenAiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
