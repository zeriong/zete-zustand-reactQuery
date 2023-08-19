import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Tag } from '../../entities/tag.entity';
import { Memo } from '../../entities/memo.entity';
import { CoreOutput } from '../../common/dtos/coreOutput.dto';
import { User } from '../../entities/user.entity';
import { CreateCategoryInput, CreateCategoryOutput } from './dtos/io/createCategory.dto';
import { UpdateCategoryInput } from './dtos/io/updateCategory.dto';
import { DeleteCategoryInput } from './dtos/io/deleteCategory.dto';
import { GetCategoriesOutput } from './dtos/io/getCategories.dto';
import { ChangeImportantInput, ChangeImportantOutput } from './dtos/io/changeImportant.dto';
import { DeleteMemoInput } from './dtos/io/deleteMemo.dto';
import { UpdateMemoInput, UpdateMemoOutput } from './dtos/io/updateMemo.dto';
import { CreateMemoInput, CreateMemoOutput } from './dtos/io/createMemo.dto';
import { SearchMemosInput, SearchMemosOutput } from './dtos/io/searchMemos.dto';
import { GetMemoInput, GetMemoOutput } from './dtos/io/getMemo.dto';
import { isIntegerString } from '../../common/common.lib';

@Injectable()
export class MemoService {
  private readonly logger = new Logger(MemoService.name);
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Memo)
    private readonly memoRepository: Repository<Memo>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  /* ================================ Category ================================ */

  /**
   * 카테고리 생성
   * @return: 생성된 카테고리 정보 포함
   * */
  async createCategory(input: CreateCategoryInput, user: User): Promise<CreateCategoryOutput> {
    try {
      if (!input.name) return { success: false, error: '추가할 카테고리 이름을 입력해주세요.' };

      //중복 검증
      const exists = await this.categoriesRepository
        .createQueryBuilder()
        .where('userId = :userId AND name = :name', {
          userId: user.id,
          name: input.name,
        })
        .getExists();

      if (exists) return { success: false, error: `이미 존재하는 카테고리 이름입니다.` };

      const result = await this.categoriesRepository.save(this.categoriesRepository.create({ name: input.name, user }));

      return { success: true, message: '새 카테고리가 생성되었습니다', savedCate: result };
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '카테고리 생성에 실패했습니다.' };
  }

  /**
   * 카테고리 업데이트
   * */
  async updateCategory(input: UpdateCategoryInput, user: User): Promise<CoreOutput> {
    try {
      if (input.name === '') {
        return { success: false, error: '비어있는 카테고리를 삭제하거나 수정할 이름을 입력하세요.' };
      }

      const result = await this.categoriesRepository
        .createQueryBuilder()
        .update({ name: input.name })
        .where('id = :id AND userId = :userId', {
          id: input.id,
          userId: user.id,
        })
        .execute();

      if (result.affected > 0) return { success: true };

      return { success: false, error: '해당카테고리는 존재하지 않습니다.' };
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '카테고리 업데이트에 실패했습니다.' };
  }

  /**
   * 카테고리 삭제
   * @description: 삭제시 변경데이터 및 데이터 무결성을 보완하기 위해 갱신된 목록 데이터 반환
   * @return: 카테고리 목록 데이터
   * */
  async deleteCategory(input: DeleteCategoryInput, user: User): Promise<GetCategoriesOutput> {
    try {
      const result = await this.categoriesRepository
        .createQueryBuilder()
        .delete()
        .where('id = :id AND userId = :userId', {
          id: input.id,
          userId: user.id,
        })
        .execute();

      if (result.affected > 0) return await this.getCategories(user);
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '카테고리 삭제에 실패했습니다.' };
  }

  /**
   * 카테고리 목록 데이터
   * @return: 카테고리 목록, 전체메모 개수, 주요메모 개수
   * */
  async getCategories(user: User): Promise<GetCategoriesOutput> {
    try {
      const categories = await this.categoriesRepository
        .createQueryBuilder()
        .leftJoinAndSelect('Category.tags', 'tags')
        .loadRelationCountAndMap('Category.memoCount', 'Category.memos')
        .where('Category.userId = :userId', { userId: user.id })
        .groupBy('Category.id, tags.name')
        .getMany();

      const memosCount = await this.memoRepository.createQueryBuilder().where('Memo.userId = :userId', { userId: user.id }).getCount();

      const importantMemoCount = await this.memoRepository
        .createQueryBuilder()
        .where('Memo.userId = :userId', { userId: user.id })
        .andWhere('Memo.isImportant = :isImportant', { isImportant: true })
        .getCount();

      return {
        success: true,
        totalMemoCount: memosCount,
        importantMemoCount,
        list: categories,
      };
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '데이터를 받아오지 못했습니다.' };
  }

  /* ================================ Memo ================================ */

  /**
   * 메모 목록 데이터
   * @return: 목록, 개수 포함
   * */
  async searchMemos(input: SearchMemosInput, user: User): Promise<SearchMemosOutput> {
    try {
      // 기본 쿼리 생성
      const qb = this.memoRepository
        .createQueryBuilder()
        .leftJoinAndSelect('Memo.tags', 'tags')
        .where('Memo.userId = :userId', { userId: user.id })
        .orderBy('Memo.updateAt', 'DESC'); // updateAt 내림차순 정렬

      // 조건
      if (input.search) {
        qb.andWhere('Memo.title LIKE :search OR Memo.content LIKE :search', {
          search: `%${input.search}%`,
        });
      }
      if (input.cate) {
        if (input.cate === 'important') {
          qb.andWhere('Memo.isImportant = :isImportant', { isImportant: true });
        } else if (isIntegerString(input.cate)) {
          qb.andWhere('Memo.cateId = :cateId', { cateId: input.cate });
          // 카테고리와 태그가 선택되었다면
          if (input.tag) {
            qb.andWhere(
              `Memo.id IN ${qb
                .subQuery()
                .from('Tag', 'tag')
                .select('tag.memoId')
                .where('tag.name = :name AND tag.userId = :userId AND tag.cateId = :cateId', {
                  name: input.tag,
                  userId: user.id,
                  cateId: input.cate,
                })
                .getQuery()}`,
            );
          }
        }
      }
      // 요청받은 메모리스트 카운팅
      const totalCount = await qb.getCount();
      const list = await qb.skip(input.offset).take(input.limit).getMany();

      return {
        success: true,
        list,
        totalCount,
      };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: `${e}` };
    }
  }

  /**
   * 메모 데이터
   * @return: 메모 데이터 포함
   * */
  async getMemo(input: GetMemoInput, user: User): Promise<GetMemoOutput> {
    try {
      const memo = await this.memoRepository
        .createQueryBuilder()
        .leftJoinAndSelect('Memo.tags', 'tags')
        .where('Memo.userId = :userId AND Memo.id = :memoId', {
          userId: user.id,
          memoId: input.id,
        })
        .getOne();

      if (memo) return { success: true, memo };

      return { success: false };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: `${e}` };
    }
  }

  /**
   * 메모 생성
   * @return: 저장한 메모 데이터 포함
   * */
  async createMemo(input: CreateMemoInput, user: User): Promise<CreateMemoOutput> {
    try {
      if (!input.content && !input.title) return { success: false, error: '메모를 입력해주세요.' };

      // 태그 데이터 보정
      const tags: Tag[] = input.tags.map((tag) => ({
        ...tag,
        cate: { id: input.cateId || null },
        user,
      }));

      const result = await this.memoRepository.save(
        this.memoRepository.create({
          title: input.title,
          content: input.content,
          isImportant: input.isImportant,
          cate: { id: input.cateId || null },
          tags: tags || [],
          user,
        }),
      );

      if (result) return { success: true, savedMemo: result };
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '메모생성에 실패했습니다.' };
  }

  /**
   * 메모 데이터 업데이트
   * */
  async updateMemo(input: UpdateMemoInput, user: User): Promise<UpdateMemoOutput> {
    try {
      if (!input.content && !input.title) return { success: false, error: '메모를 입력해주세요.' };
      // 태그 데이터 보정
      const tags: Tag[] = input.tags.map((tag) => ({
        ...tag,
        cate: { id: input.cateId || null },
        user,
      }));
      // 기존 데이터와 업데이트 데이터를 비교해 업데이트 데이터에 없는 목록은 삭제
      const prevTags = await this.tagsRepository.find({ where: { memo: { id: input.id }, user: { id: user.id } } });
      const removeTags = prevTags.filter((prevTag) => !tags.some((tag) => tag.id === prevTag.id));
      if (removeTags.length > 0) await this.tagsRepository.remove(removeTags);

      // 태그 데이터까지 모두 save하여 데이터를 추가하여 업데이트만 한다.(삭제 x)
      const result = await this.memoRepository.save({
        id: input.id,
        title: input.title,
        content: input.content,
        isImportant: input.isImportant,
        tags: tags || [],
        cate: { id: input.cateId || null },
        user,
      });

      if (result) {
        const savedMemo = {
          ...result,
          cateId: result.cate.id,
          updateAt: new Date(),
        };
        return { success: true, savedMemo };
      }
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '잘못된 접근입니다.' };
  }

  /**
   * 메모 삭제
   * */
  async deleteMemo(input: DeleteMemoInput, user: User): Promise<CoreOutput> {
    try {
      if (!input.id) return { success: false, error: '이미 삭제된 메모입니다.' };

      const deleteMemo = await this.memoRepository
        .createQueryBuilder()
        .delete()
        .where('userId = :userId AND id = :id', { userId: user.id, id: input.id })
        .execute();

      if (deleteMemo.affected > 0) return { success: true, message: '메모가 삭제되었습니다.' };

      return { success: false, error: '메모삭제에 실패했습니다.' };
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '메모삭제에 실패했습니다.' };
  }

  /**
   * 메모의 중요도 변경
   * @return: 중요 메모 개수 포함
   * */
  async changeImportant(input: ChangeImportantInput, user: User): Promise<ChangeImportantOutput> {
    try {
      const result = await this.memoRepository
        .createQueryBuilder()
        .update({ isImportant: () => 'NOT isImportant' })
        .where('id = :id AND userId = :userId', { id: input.id, userId: user.id })
        .execute();

      if (result.affected > 0) {
        const totalImportantCount = await this.memoRepository
          .createQueryBuilder()
          .where('isImportant = :isImportant', { isImportant: true })
          .getCount();

        return { success: true, totalImportantCount };
      } else {
        return { success: false, error: '해당메모는 존재하지 않습니다.' };
      }
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '잘못된 접근입니다.' };
  }
}
