import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { OpenAiService } from './openAi.service';
import { CreateCompletionDto, CreateCompletionOutputDto } from './dto/createCompletion.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { validate } from 'class-validator';
import { getObjectFirstValue } from '../../common/common.lib';

@ApiTags('OpenAi')
@Controller('openAi')
export class OpenAiController {
  constructor(private readonly aiService: OpenAiService) {}

  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: CreateCompletionOutputDto })
  @Post('createCompletion')
  async createCompletion(@Body() input: CreateCompletionDto, @Req() req): Promise<CreateCompletionOutputDto> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.aiService.createCompletion(input, req.user);
  }
}
