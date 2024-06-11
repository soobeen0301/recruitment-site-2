import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { createResumeValidator } from '../middlewares/validators/create-resume-validator.middleware.js';
import { updatedResumeValidator } from '../middlewares/validators/update-resume-validator.middleware.js';
import { USER_ROLE } from '../constants/user.constant.js';
import { requireRoles } from '../middlewares/require-roles.middleware.js';
import { updatedResumeStatusValidator } from '../middlewares/validators/update-resume-status-validator.middleware.js';

const router = express.Router();

/** 이력서 생성 API **/
router.post('/resumes', createResumeValidator, async (req, res, next) => {
  try {
    const user = req.user;
    const { title, introduction } = req.body;

    const userId = user.id;

    // 이력서 생성
    const data = await prisma.resume.create({
      data: {
        userId,
        title,
        introduction,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.RESUMES.CREATE.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 목록 조회 API **/
router.get('/resumes', async (req, res, next) => {
  try {
    const user = req.user;
    let { sort } = req.query;

    const userId = user.id;

    //정렬
    sort = sort?.toLowerCase();
    if (sort !== 'desc' && sort !== 'asc') {
      sort = 'desc';
    }

    const whereCondition = {};
    // 채용 담당자인 경우
    if (user.role === USER_ROLE.RECRUITER) {
      const { status } = req.query;

      if (status) {
        whereCondition.status = status;
      }
    }
    // 지원자인 경우
    else {
      whereCondition.userId = +userId;
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
    data = data.map((resume) => {
      return {
        id: resume.id,
        userName: resume.user.name,
        title: resume.title,
        introduction: resume.introduction,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      };
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 상세 조회 API **/
router.get('/resumes/:id', async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;

    const { id } = req.params;

    const whereCondition = { id: +id };
    if (user.role !== USER_ROLE.RECRUITER) {
      whereCondition.userId = +userId;
    }

    //이력서 조회
    let data = await prisma.resume.findUnique({
      where: whereCondition,
      include: { user: true },
    });

    //이력서가 없다면 오류
    if (!data) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      });
    }

    data = {
      id: data.id,
      userName: data.user.name,
      title: data.title,
      introduction: data.introduction,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    //data.userName = data.user.name;
    // data.userId = undefined;
    //data.user = undefined;

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 수정 API **/
router.put('/resumes/:id', updatedResumeValidator, async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;
    const { id } = req.params;
    const { title, introduction } = req.body;

    // 유효성 검사
    const isExistResume = await prisma.resume.findUnique({
      where: { id: +id, userId },
      include: { user: true },
    });

    if (!isExistResume) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      });
    }

    //이력서 수정
    const data = await prisma.resume.update({
      where: { id: +id, userId },
      data: { ...(title && { title }), ...(introduction && { introduction }) },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.UPDATE.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/** 이력서 삭제 API **/
router.delete('/resumes/:id', async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;
    const { id } = req.params;

    // 유효성 검사
    const isExistResume = await prisma.resume.findUnique({
      where: { id: +id, userId },
    });

    if (!isExistResume) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      });
    }

    //이력서 삭제
    const data = await prisma.resume.delete({
      where: { id: +id, userId },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.DELETE.SUCCEED,
      data: { id: data.id },
    });
  } catch (err) {
    next(err);
  }
});

/* 이력서 지원 상태 변경 API */
router.patch(
  '/resumes/:id/status',
  requireRoles([USER_ROLE.RECRUITER]),
  updatedResumeStatusValidator,
  async (req, res, next) => {
    try {
      const user = req.user;
      const recruiterId = user.id;
      const { id } = req.params;
      const { status, reason } = req.body;

      //트랜잭션
      await prisma.$transaction(async (tx) => {
        //이력서 정보 조회
        const isExistResume = await prisma.resume.findUnique({
          where: { id: +id },
        });

        //이력서 정보가 없는 경우
        if (!isExistResume) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            status: HTTP_STATUS.NOT_FOUND,
            message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
          });
        }

        //이력서 정보 수정
        const updatedResume = await tx.resume.update({
          where: { id: +id },
          data: { status },
        });

        //test code : throw new Error('일부러 만든 에러입니다.');

        //이력서 로그 생성
        const data = await tx.resumeLog.create({
          data: {
            recruiterId,
            resumeId: isExistResume.id,
            oldStatus: isExistResume.status,
            newStatus: updatedResume.status,
            reason,
          },
        });

        return res.status(HTTP_STATUS.OK).json({
          status: HTTP_STATUS.OK,
          messages: MESSAGES.RESUMES.UPDATE.STATUS.SUCCEED,
          data,
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

/* 이력서 로그 목록 조회 API */
router.get('/resumes/:id/logs', async (req, res, next) => {
  try {
    const { id } = req.params;

    let data = await prisma.resumeLog.findMany({
      where: { resumeId: +id },
      orderBy: { createdAt: 'desc' },
      include: {
        recruiter: true,
      },
    });

    data = data.map((log) => {
      return {
        id: log.id,
        recruiterName: log.recruiter.name,
        resumeId: log.resumeId,
        oldStatus: log.oldStatus,
        newStatus: log.newStatus,
        reason: log.reason,
        createdAt: log.createdAt,
      };
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      messages: MESSAGES.RESUMES.READ_LIST.LOG.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
