import express from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { prisma } from '../routers/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { RESUME_STATUS } from '../constants/resume.constant.js';

const router = express.Router();

/** 이력서 생성 API **/
router.post('/resumes', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.user;
    const { title, introduction } = req.body;

    // 유효성 검사
    if (!title || !introduction) {
      return res
        .status(400)
        .json({ message: '제목, 자기소개를 입력해 주세요.' });
    }

    if (introduction.length < 150) {
      return res
        .status(400)
        .json({ message: '자기소개는 150자 이상 작성해야 합니다.' });
    }

    // 이력서 생성
    const resume = await prisma.resumes.create({
      data: {
        userId: id,
        title,
        introduction,
        status: RESUME_STATUS.APPLY,
      },
    });

    return res.status(201).json({
      status: 201,
      message: '이력서가 생성되었습니다.',
      data: {
        resumeId: resume.resumeId,
        userId: resume.userId,
        title: resume.title,
        introduction: resume.introduction,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
