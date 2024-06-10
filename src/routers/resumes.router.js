import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { createResumeValidator } from '../middlewares/validators/create-resume-validator.middleware.js';

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
    const { id } = req.user;
    const { sort } = req.query;

    const resumes = await prisma.resumes.findMany({
      where: { userId: id },
      orderBy: { createdAt: sort?.toLowerCase() === 'asc' ? 'asc' : 'desc' },
      include: {
        user: {
          include: {
            userInfos: true,
          },
        },
      },
    });

    // 유효성 검사
    if (resumes.length === 0) {
      return res.status(200).json({ data: [] });
    }

    //이력서 목록
    const resumeList = resumes.map((resume) => ({
      resumeId: resume.resumeId,
      name: resume.user.userInfos.name,
      title: resume.title,
      introduction: resume.introduction,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    }));

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
router.get('/resumes/:resumeid', async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;
    const resumeId = parseInt(req.params.resumeid);

    // 유효성 검사
    const resume = await prisma.resumes.findFirst({
      where: { resumeId, userId },
      include: { user: { include: { userInfos: true } } },
    });

    if (!resume) {
      return res.status(404).json({ message: '이력서가 존재하지 않습니다.' });
    }

    //이력서 상세 내용
    const resumeDetail = {
      resumeId: resume.resumeId,
      name: resume.user.userInfos.name,
      title: resume.title,
      introduction: resume.introduction,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };

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
router.put('/resumes/:resumeid', async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;
    const resumeId = parseInt(req.params.resumeid);
    const { title, introduction } = req.body;

    // 유효성 검사
    if (!title || !introduction) {
      return res.status(400).json({ message: '수정 할 정보를 입력해 주세요.' });
    }

    const resume = await prisma.resumes.findFirst({
      where: { resumeId, userId },
    });

    if (!resume) {
      return res.status(404).json({ message: '이력서가 존재하지 않습니다.' });
    }

    //이력서 수정
    const resumeUpdate = await prisma.resumes.update({
      where: { resumeId },
      data: { title, introduction },
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
router.delete('/resumes/:resumeid', async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;
    const resumeId = parseInt(req.params.resumeid);

    // 유효성 검사
    const resume = await prisma.resumes.findFirst({
      where: { resumeId, userId },
    });

    if (!resume) {
      return res.status(404).json({ message: '이력서가 존재하지 않습니다.' });
    }

    // 이력서 삭제
    await prisma.resumes.delete({
      where: { resumeId },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.DELETE.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
