import { prisma } from '../utils/prisma.util.js';
import { USER_ROLE } from '../constants/user.constant.js';

export class ResumesRepository {
  /* 이력서 생성 API */
  create = async (userId, title, introduction) => {
    const data = await prisma.resume.create({
      data: {
        userId,
        title,
        introduction,
      },
    });
    return data;
  };

  /* 이력서 목록 조회 API */
  readMany = async (user, sort, status) => {
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
    let data = await prisma.resume.findMany({
      where: whereCondition,
      orderBy: { createdAt: sort },
      include: {
        user: true,
      },
    });

    //이력서 조회 시 출력될 내용
    data = data.map((resume) => ({
      id: resume.id,
      userName: resume.user.name,
      title: resume.title,
      introduction: resume.introduction,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    }));

    return data;
  };

  /* 이력서 상세 조회 API */
  readOne = async (whereCondition, includeUser = false) => {
    //이력서 조회
    let data = await prisma.resume.findUnique({
      where: whereCondition,
      include: { user: includeUser },
    });

    if (!data) {
      return null;
    }

    if (includeUser) {
      data = {
        id: data.id,
        userName: data.user.name,
        title: data.title,
        introduction: data.introduction,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    }
    return data;
  };

  /* 이력서 수정 API */
  update = async (id, userId, title, introduction) => {
    //이력서 수정
    const data = await prisma.resume.update({
      where: { id: +id, userId: +userId },
      data: {
        ...(title && { title }),
        ...(introduction && { introduction }),
      },
    });
    return data;
  };

  /* 이력서 삭제 API */
  delete = async (userId, id) => {
    //이력서 삭제
    const data = await prisma.resume.delete({
      where: { id: +id, userId: +userId },
    });

    return { id: data.id };
  };

  /* 이력서 지원 상태 변경 API */
  updateStatus = async (user, id, isExistResume, status, reason) => {
    //트랜잭션
    return await prisma.$transaction(async (tx) => {
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
  readLog = async (id) => {
    let data = await prisma.resumeLog.findMany({
      where: { resumeId: +id },
      orderBy: { createdAt: 'desc' },
      include: {
        recruiter: true,
      },
    });

    if (!data || data.length === 0) {
      return null;
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
