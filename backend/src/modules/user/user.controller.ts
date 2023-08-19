import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { CoreOutput } from '../../common/dtos/coreOutput.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { validate } from 'class-validator';
import { CreateAccountInput } from './dtos/createAccount.dto';
import { getObjectFirstValue } from '../../common/common.lib';
import { UpdateAccountInput } from './dtos/updateAccount.dto';
import { GetGptUsableCountOutput } from './dtos/getGptUsableCount.dto';

@Controller('user')
@ApiTags('User') //스웨거 Tag를 지정
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 유저데이터 전체 검색 */
  @ApiResponse({ type: User, isArray: true })
  @Get('getAll')
  getAll(): Promise<User[]> {
    return this.userService.getAll();
  }

  /** 유저데이터 생성 */
  @ApiResponse({ type: CoreOutput })
  @Post('createAccount')
  async createAccount(@Body() input: CreateAccountInput): Promise<CoreOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.userService.createAccount(input);
  }

  /** 유저데이터 수정 */
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: CoreOutput })
  @Patch('updateProfile')
  async updateProfile(@Req() req, @Body() updateData: UpdateAccountInput): Promise<CoreOutput> {
    return this.userService.updateProfile(req.user, updateData);
  }

  /** 프로필 response */
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: User })
  @Get('getProfile')
  async getProfile(@Req() req): Promise<User> {
    return await this.userService.getProfile(req.user.id);
  }

  /** id로 유저데이터 삭제 */
  @ApiResponse({ type: CoreOutput })
  @Delete(':id')
  async deleteAccount(@Param('id') id: number): Promise<CoreOutput> {
    return this.userService.deleteAccount(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: GetGptUsableCountOutput })
  @Patch('getGptUsableCount')
  async getGptUsableCount(@Req() req): Promise<GetGptUsableCountOutput> {
    return this.userService.getGptUsableCount(req.user);
  }
}
