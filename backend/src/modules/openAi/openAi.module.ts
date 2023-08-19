import { Module } from '@nestjs/common';
import { OpenAiService } from './openAi.service';
import { OpenAiController } from './openAi.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [OpenAiController],
  providers: [OpenAiService],
})
export class OpenAiModule {}
