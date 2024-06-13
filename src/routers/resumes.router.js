import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { USER_ROLE } from '../constants/user.constant.js';
import { createResumeValidator } from '../middlewares/validators/create-resume-validator.middleware.js';
import { updatedResumeValidator } from '../middlewares/validators/update-resume-validator.middleware.js';
import { requireRoles } from '../middlewares/require-roles.middleware.js';
import { updatedResumeStatusValidator } from '../middlewares/validators/update-resume-status-validator.middleware.js';
import { ResumesController } from '../controllers/resumes.controller.js';

const router = express.Router();
const resumesController = new ResumesController();

/** 이력서 생성 API **/
router.post('/resumes', createResumeValidator, resumesController.createPost);

/** 이력서 목록 조회 API **/
router.get('/resumes', resumesController.findPosts);

/** 이력서 상세 조회 API **/
router.get('/resumes/:id', resumesController.findPost);

/** 이력서 수정 API **/
router.put(
  '/resumes/:id',
  updatedResumeValidator,
  resumesController.updateResume
);

/** 이력서 삭제 API **/
router.delete('/resumes/:id', resumesController.deleteResume);

/* 이력서 지원 상태 변경 API */
router.patch(
  '/resumes/:id/status',
  requireRoles([USER_ROLE.RECRUITER]),
  updatedResumeStatusValidator,
  resumesController.updateResumeStatus
);

/* 이력서 로그 목록 조회 API */
router.get(
  '/resumes/:id/logs',
  requireRoles([USER_ROLE.RECRUITER]),
  async (req, res, next) => {
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
  }
);

export default router;
