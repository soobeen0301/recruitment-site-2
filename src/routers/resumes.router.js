import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { USER_ROLE } from '../constants/user.constant.js';
import { createResumeValidator } from '../middlewares/validators/create-resume-validator.middleware.js';
import { updatedResumeValidator } from '../middlewares/validators/update-resume-validator.middleware.js';
import { requireRoles } from '../middlewares/require-roles.middleware.js';
import { updatedResumeStatusValidator } from '../middlewares/validators/update-resume-status-validator.middleware.js';
import { ResumesController } from '../controllers/resumes.controller.js';
import { ResumesRepository } from '../repositories/resumes.repository.js';
import { ResumesService } from '../services/resumes.service.js';

const router = express.Router();

const resumesRepository = new ResumesRepository(prisma);
const resumesService = new ResumesService(resumesRepository);
const resumesController = new ResumesController(resumesService);

/** 이력서 생성 API **/
router.post('/resumes', createResumeValidator, resumesController.create);

/** 이력서 목록 조회 API **/
router.get('/resumes', resumesController.readMany);

/** 이력서 상세 조회 API **/
router.get('/resumes/:id', resumesController.readOne);

/** 이력서 수정 API **/
router.put('/resumes/:id', updatedResumeValidator, resumesController.update);

/** 이력서 삭제 API **/
router.delete('/resumes/:id', resumesController.delete);

/* 이력서 지원 상태 변경 API */
router.patch(
  '/resumes/:id/status',
  requireRoles([USER_ROLE.RECRUITER]),
  updatedResumeStatusValidator,
  resumesController.updateStatus
);

/* 이력서 로그 목록 조회 API */
router.get(
  '/resumes/:id/logs',
  requireRoles([USER_ROLE.RECRUITER]),
  resumesController.readLog
);

export default router;
