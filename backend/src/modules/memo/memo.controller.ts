import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MemoService } from './memo.service';
import { CoreOutput } from '../../common/dtos/coreOutput.dto';
import { UpdateMemoInput } from './dtos/io/updateMemo.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { GetCategoriesOutput } from './dtos/io/getCategories.dto';
import { CreateCategoryInput, CreateCategoryOutput } from './dtos/io/createCategory.dto';
import { validate } from 'class-validator';
import { getObjectFirstValue } from '../../common/common.lib';
import { UpdateCategoryInput } from './dtos/io/updateCategory.dto';
import { DeleteCategoryInput } from './dtos/io/deleteCategory.dto';
import { GetMemoInput, GetMemoOutput } from './dtos/io/getMemo.dto';
import { SearchMemosInput, SearchMemosOutput } from './dtos/io/searchMemos.dto';
import { ChangeImportantInput, ChangeImportantOutput } from './dtos/io/changeImportant.dto';
import { DeleteMemoInput } from './dtos/io/deleteMemo.dto';
import { UpdateMemoOutput } from './dtos/io/updateMemo.dto';
import { CreateMemoInput, CreateMemoOutput } from './dtos/io/createMemo.dto';

@Controller('memo')
@ApiTags('Memo')
@UseGuards(JwtAuthGuard)
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  /** Category ----------------------------------------------------- */
  @ApiResponse({ type: GetCategoriesOutput })
  @Get('getCategories')
  async getCategories(@Req() req): Promise<GetCategoriesOutput> {
    return this.memoService.getCategories(req.user);
  }

  @ApiResponse({ type: CreateCategoryOutput })
  @Post('createCategory')
  async createCategory(@Req() req, @Body() input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.memoService.createCategory(input, req.user);
  }

  @ApiResponse({ type: CoreOutput })
  @Patch('updateCategory')
  async updateCategory(@Req() req, @Body() input: UpdateCategoryInput): Promise<CoreOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.memoService.updateCategory(input, req.user);
  }

  @ApiResponse({ type: GetCategoriesOutput })
  @Delete('deleteCategory')
  async deleteCategory(@Req() req, @Body() input: DeleteCategoryInput): Promise<GetCategoriesOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.memoService.deleteCategory(input, req.user);
  }

  /** memo ----------------------------------------------------- */

  @ApiResponse({ type: SearchMemosOutput })
  @Patch('searchMemos')
  async searchMemos(@Req() req, @Body() input: SearchMemosInput): Promise<SearchMemosOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.memoService.searchMemos(input, req.user);
  }

  @ApiResponse({ type: GetMemoOutput })
  @Patch('getMemo')
  async getMemo(@Req() req, @Body() input: GetMemoInput): Promise<GetMemoOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.memoService.getMemo(input, req.user);
  }

  @ApiResponse({ type: CreateMemoOutput })
  @Post('createMemo')
  async createMemo(@Req() req, @Body() input: CreateMemoInput): Promise<CreateMemoOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.memoService.createMemo(input, req.user);
  }

  @ApiResponse({ type: UpdateMemoOutput })
  @Patch('updateMemo')
  async updateMemo(@Req() req, @Body() input: UpdateMemoInput): Promise<UpdateMemoOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.memoService.updateMemo(input, req.user);
  }

  @ApiResponse({ type: CoreOutput })
  @Delete('deleteMemo')
  async deleteMemo(@Req() req, @Body() input: DeleteMemoInput): Promise<CoreOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.memoService.deleteMemo(input, req.user);
  }

  @ApiResponse({ type: ChangeImportantOutput })
  @Patch('changeImportant')
  async changeImportant(@Req() req, @Body() input: ChangeImportantInput): Promise<ChangeImportantOutput> {
    const errors = await validate(input);
    if (errors.length > 0) return { success: false, target: errors[0].property, error: getObjectFirstValue(errors[0].constraints) };

    return this.memoService.changeImportant(input, req.user);
  }
}
