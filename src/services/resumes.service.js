import { USER_ROLE } from '../constants/user.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { HttpError } from '../errors/http.error.js';
export class ResumesService {
  constructor(resumesRepository) {
    this.resumesRepository = resumesRepository;
  }

  /* 이력서 생성 API */
  create = async (userId, title, introduction) => {
    const data = await this.resumesRepository.create(
      userId,
      title,
      introduction
    );
    return data;
  };

  /* 이력서 목록 조회 API */
  readMany = async (user, sort, status) => {
    const data = await this.resumesRepository.readMany(user, sort, status);

    return data;
  };

  /* 이력서 상세 조회 API */
  readOne = async (user, id) => {
    const whereCondition = { id: +id };

    if (user.role !== USER_ROLE.RECRUITER) {
      whereCondition.userId = +user.id;
    }

    //이력서 조회
    let data = await this.resumesRepository.readOne(whereCondition, true);

    //이력서가 없다면 오류
    if (!data) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    return data;
  };

  /* 이력서 수정 API */
  update = async (user, id, title, introduction) => {
    id = Number(id);
    const whereCondition = { id, userId: user.id };

    const isExistResume = await this.resumesRepository.readOne(whereCondition);

    if (!isExistResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    //이력서 수정
    const data = await this.resumesRepository.update(
      id,
      user.id,
      title,
      introduction
    );
    return data;
  };

  /* 이력서 삭제 API */
  delete = async (user, id) => {
    const whereCondition = { id: +id, userId: user.id };

    const isExistResume = await this.resumesRepository.readOne(whereCondition);

    if (!isExistResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    //이력서 삭제
    const data = await this.resumesRepository.delete(user.id, id);

    return data;
  };

  /* 이력서 지원 상태 변경 API */
  updateStatus = async (user, id, status, reason) => {
    const whereCondition = { id: +id };

    const isExistResume = await this.resumesRepository.readOne(whereCondition);

    if (!isExistResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }
    //이력서 정보 수정
    const data = await this.resumesRepository.updateStatus(
      user,
      id,
      isExistResume,
      status,
      reason
    );

    return data;
  };

  /* 이력서 로그 목록 조회 API */
  readLog = async (id) => {
    const data = await this.resumesRepository.readLog(id);

    if (!data || data.length === 0) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    return data;
  };
}
