import { Injectable, Logger } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { CreateCompletionDto, CreateCompletionOutputDto } from './dto/createCompletion.dto';
import { User } from '../../entities/user.entity';
import { UserService } from '../user/user.service';
import { MemoService } from '../memo/memo.service';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(MemoService.name);
  private openAiApi: OpenAIApi;

  constructor(private readonly userService: UserService) {
    const configuration = new Configuration({
      organization: process.env.ORGANIZATION_ID,
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openAiApi = new OpenAIApi(configuration);
  }

  /** openAi gpt 채팅 생성
   * @description: 메모작성 반영시 용이하도록 role: 'system'을 통해 간단명료한 답변을 요구하며 답변이 500자가 넘는 경우 더 많이 요약, 함축하여 답변
   * @return 결과 메세지, 남은 횟수
   * */
  async createCompletion(input: CreateCompletionDto, user: User): Promise<CreateCompletionOutputDto> {
    try {
      if (user.gptUsableCount === 0) {
        return { success: true, message: '질문 가능한 횟수를 초과하였습니다' };
      }

      // gpt 3.5 turbo 요청
      const response = await this.openAiApi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a robot that answers user questions simply and clearly to make notes and write them down. If there are more than 500 characters to answer, you should summarize more and send the answer.',
          },
          { role: 'user', content: input.content },
        ],
        temperature: 0, // 명확한 답변을 위한 온도설정
        max_tokens: 1000,
      });

      // 요청성공시 사용 가능 횟수 차감
      const res = await this.userService.update(user.id, { gptUsableCount: --user.gptUsableCount });

      if (res) {
        return {
          gptResponse: response.data.choices[0].message.content,
          usableCount: user.gptUsableCount,
          success: true,
        };
      }
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: 'Chat-GPT 서버에 접속할 수 없습니다.' };
  }
}
