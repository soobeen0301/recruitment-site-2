import { prisma } from '../utils/prisma.util.js';
import { USER_ROLE } from '../constants/user.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { HttpError } from '../errors/http.error.js';
export class ResumesService {
  /* 이력서 생성 API */
  createPost = async (userId, title, introduction) => {
    const post = await prisma.resume.create({
      data: {
        userId,
        title,
        introduction,
      },
    });
    return post;
  };

  /* 이력서 목록 조회 API */
  findPosts = async (user, sort, status) => {
    //정렬
    sort = sort?.toLowerCase();
    if (sort !== 'desc' && sort !== 'asc') {
      sort = 'desc';
    }

    const whereCondition = {};

    // 채용 담당자인 경우
    if (user.role === USER_ROLE.RECRUITER) {
      if (status) {
        whereCondition.status = status;
      }
    }
    // 지원자인 경우
    else {
      whereCondition.userId = +user.id;
    }

    //이력서 목록 조회
    const data = await prisma.resume.findMany({
      where: whereCondition,
      orderBy: { createdAt: sort },
      include: {
        user: true,
      },
    });
    return data;
  };

  /* 이력서 상세 조회 API */
  findPost = async (user, id) => {
    const whereCondition = { id: +id };

    if (user.role !== USER_ROLE.RECRUITER) {
      whereCondition.userId = +user.id;
    }

    //이력서 조회
    const data = await prisma.resume.findUnique({
      where: whereCondition,
      include: { user: true },
    });

    //이력서가 없다면 오류
    if (!data) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }
    return data;
  };

  /* 이력서 수정 API */
  updateResume = async (user, id, title, introduction) => {
    const isExistResume = await prisma.resume.findUnique({
      where: { id: +id },
      include: { user: true },
    });

    if (!isExistResume || isExistResume.userId !== user.id) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    //이력서 수정
    const data = await prisma.resume.update({
      where: { id: +id },
      data: {
        ...(title && { title }),
        ...(introduction && { introduction }),
      },
    });
    return data;
  };

  /* 이력서 삭제 API */
  deleteResume = async (user, id) => {
    // 유효성 검사
    const isExistResume = await prisma.resume.findUnique({
      where: { id: +id },
    });

    if (!isExistResume || isExistResume.userId !== user.id) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    //이력서 삭제
    const data = await prisma.resume.delete({
      where: { id: +id },
    });
    return data;
  };

  /* 이력서 지원 상태 변경 API */
  updateResumeStatus = async (user, id, status, reason) => {
    //트랜잭션
    return await prisma.$transaction(async (tx) => {
      //이력서 정보 조회
      const isExistResume = await prisma.resume.findUnique({
        where: { id: +id },
      });

      //이력서 정보가 없는 경우
      if (!isExistResume) {
        throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
      }

      //이력서 정보 수정
      const updatedResume = await tx.resume.update({
        where: { id: +id },
        data: { status },
      });

      //이력서 로그 생성
      const data = await tx.resumeLog.create({
        data: {
          recruiterId: user.id,
          resumeId: isExistResume.id,
          oldStatus: isExistResume.status,
          newStatus: updatedResume.status,
          reason,
        },
      });
      return data;
    });
  };

  /* 이력서 로그 목록 조회 API */
  findPostsLog = async (id) => {
    let data = await prisma.resumeLog.findMany({
      where: { resumeId: +id },
      orderBy: { createdAt: 'desc' },
      include: {
        recruiter: true,
      },
    });

    if (!data || data.length === 0) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }

    data = data.map((log) => ({
      id: log.id,
      recruiterName: log.recruiter.name,
      resumeId: log.resumeId,
      oldStatus: log.oldStatus,
      newStatus: log.newStatus,
      reason: log.reason,
      createdAt: log.createdAt,
    }));
    return data;
  };
}
