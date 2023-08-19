import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';
import { Memo } from '../../entities/memo.entity';
import { Tag } from '../../entities/tag.entity';
import { MemoService } from './memo.service';
import { MemoController } from './memo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Memo, Category, Tag])],
  controllers: [MemoController],
  providers: [MemoService],
  exports: [MemoService],
})
export class MemoModule {}
