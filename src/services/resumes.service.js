import { prisma } from '../utils/prisma.util.js';
import { USER_ROLE } from '../constants/user.constant.js';
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
      throw {
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      };
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
      throw {
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      };
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
      throw {
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      };
    }

    //이력서 삭제
    const data = await prisma.resume.delete({
      where: { id: +id },
    });
    return data;
  };
}
