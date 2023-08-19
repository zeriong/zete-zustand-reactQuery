import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CoreOutput } from '../../common/dtos/coreOutput.dto';
import * as Validator from 'class-validator';
import { CreateAccountInput } from './dtos/createAccount.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { GetGptUsableCountOutput } from './dtos/getGptUsableCount.dto';
import { UpdateAccountInput } from './dtos/updateAccount.dto';

/** 실질적인 서비스 구현 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 계정생성
   * @description 컨트롤러 주입 용도
   * */
  async createAccount(input: CreateAccountInput): Promise<CoreOutput> {
    try {
      //중복 검증
      const exists = await this.userRepository.findOne({ where: { email: input.email } });

      if (exists) return { success: false, target: 'email', error: `이미 등록된 이메일입니다.` };

      // 유저 데이터 생성 후 저장
      await this.userRepository.save(
        await this.userRepository.create({
          email: input.email,
          password: await bcrypt.hash(input.password, 10),
          name: input.name,
          mobile: input.mobile,
          gptUsableCount: 10,
          gptUsableCountResetAt: new Date(),
        }),
      );

      return { success: true };
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: '계정 생성에 실패했습니다.' };
  }

  /**
   * gpt 사용 가능 횟수
   * @return 잔여 횟수를 포함하여 반환
   * @description 컨트롤러 주입 용도
   * */
  async getGptUsableCount(user: User): Promise<GetGptUsableCountOutput> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const resetAt = new Date(user.gptUsableCountResetAt);
      resetAt.setHours(0, 0, 0, 0);

      // 당일이 아니면 횟수 초기화
      if (resetAt.getTime() !== today.getTime()) {
        const res = await this.userRepository.update(user.id, { gptUsableCount: 10, gptUsableCountResetAt: today });
        if (res.affected > 0) return { success: true, count: 10 };
        else return { success: false, error: '잘못된 접근입니다.' };
      }

      return { success: true, count: user.gptUsableCount };
    } catch (e) {
      this.logger.error(e);
    }

    return { success: false, error: 'Chat GPT 통신 실패.' };
  }

  /**
   * 프로필 업데이트
   * @description 컨트롤러 주입 용도
   * */
  async updateProfile(user: User, updateData: UpdateAccountInput): Promise<CoreOutput> {
    try {
      const thisEmail = user.email;
      const emailExists = await this.userRepository.findOne({ where: [{ email: updateData.email }] });
      const mobileExists = await this.userRepository.findOne({ where: [{ mobile: updateData.mobile }] });

      if (thisEmail != updateData.email && emailExists) return { success: false, error: '중복된 이메일입니다.', target: 'email' };
      if (thisEmail != updateData.email && mobileExists) return { success: false, error: '중복된 휴대폰입니다.' };

      const userData = { email: updateData.email, name: updateData.name, mobile: updateData.mobile };

      if (updateData.password === '') {
        await this.userRepository.update(user.id, userData);
        return { success: true };
      }

      const password = await bcrypt.hash(updateData.password, 10);
      await this.userRepository.update(user.id, { ...userData, password });

      return { success: true };
    } catch (e) {
      return { success: false, error: '유저 데이터 업데이트 실패' };
    }
  }

  /**
   * 유저 삭제
   * @description 컨트롤러 주입 용도
   * */
  async deleteAccount(userId: number): Promise<CoreOutput> {
    const result = await this.userRepository.delete(userId);
    if (result.affected > 0) return { success: true };

    return { success: false, error: '해당 아이디는 존재하지 않습니다.' };
  }

  /** 로그인 검증 */
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      let user: User = null;
      //이메일 유효성 검사
      if (Validator.isEmail(email) && email.length >= 6) {
        user = await this.userRepository
          .createQueryBuilder() //이 후에 SQL쿼리언어처럼 DB에서 데이터조회 가능
          .select('*') //쿼리빌더 이후로 지정해준 쿼리같은 메소드
          .where('email = :email', { email: email }) //조회조건
          .getRawOne(); //Raw통째로 가져온다. 유효성이 검증되면 user를 반환하고, user = 해당유저의 데이터이다.(email,password,id,token 등등)
      }

      if (user && bcrypt.compareSync(password, user.password)) {
        return user;
      }
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }

  /** 프로필 응답 */
  async getProfile(id: number): Promise<User | null> {
    try {
      const result = await this.findById(id);
      if (result) return result;
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }

  /** 모든유저정보 */
  async getAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  /** id 검색 (실패시 오류반환) */
  async findById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }
  /** 업데이트 */
  async update(userId: number, updateData: QueryDeepPartialEntity<User>): Promise<boolean> {
    try {
      const res = await this.userRepository.update(userId, updateData);
      if (res.affected > 0) return true;
    } catch (e) {
      this.logger.error(e);
    }

    return false;
  }
}
