import express from 'express';
import { prisma } from '../routers/index.js';
import bcrypt from 'bcrypt';
import validator from 'validator';

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  try {
    const { email, password, passwordConfirm, name } = req.body;

    // 유효성 검사
    if (!email || !password || !passwordConfirm || !name) {
      return res.status(400).json({ message: '모든 필드를 입력해 주세요.' });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ message: '이메일 형식이 올바르지 않습니다.' });
    }

    const isExistUser = await prisma.users.findFirst({ where: { email } });

    if (isExistUser) {
      return res.status(409).json({ message: '이미 가입 된 사용자입니다.' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: '비밀번호는 6자리 이상이어야 합니다.' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 비밀번호 해시화하기
    const hashedPassword = await bcrypt.hash(password, 10);

    // Users 테이블에 사용자 추가
    const role = 'APPLICANT';
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        userInfos: { create: { name, role } }, // 이름 추가
      },
      include: { userInfos: true },
    });

    return res.status(201).json({
      status: 201,
      message: '회원가입에 성공했습니다.',
      data: {
        id: user.id,
        email: user.email,
        name: user.userInfos.name,
        role: user.userInfos.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
