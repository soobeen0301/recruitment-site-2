import express from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import { JWT_SECRET } from '../constants/env.constant.js';
import { USERS_STATUS } from '../constants/user.constant.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { signUpValidator } from '../middlewares/validators/sign-up-validator.middleware.js';
import { signInValidator } from '../middlewares/validators/sign-in-validator.middleware.js';
import { HASH_SALT_ROUDNDS } from '../constants/auth.constant.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/sign-up', signUpValidator, async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // 유효성 검사 (이메일이 중복된 경우)
    const isExistUser = await prisma.user.findFirst({ where: { email } });

    if (isExistUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: HTTP_STATUS.CONFLICT,
        message: MESSAGES.USER.COMMON.EMAIL.DUPLICATED,
      });
    }

    // 비밀번호 해시화하기
    const hashedPassword = bcrypt.hashSync(password, HASH_SALT_ROUDNDS);

    // User 테이블에 사용자 추가
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    //비밀번호 출력되지 않도록
    user.password = undefined;

    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.USER.SIGN_UP.SUCCEED,
      user,
    });
  } catch (err) {
    next(err);
  }
});

/* 사용자 로그인 API */
router.post('/sign-in', signInValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 유효성 검사
    const user = await prisma.user.findUnique({ where: { email } });

    const isPasswordMatched =
      user && bcrypt.compareSync(password, user.password);

    //if (!user || !(await bcrypt.compare(password, user.password))) {
    //return res
    //.status(401)
    // .json({ message: '인증 정보가 유효하지 않습니다.' });
    // }

    // AccessToken 생성
    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET,

      { expiresIn: '12h' }
    );

    res.cookie('authorization', `Bearer ${token}`);

    return res
      .status(HTTP_STATUS.OK)
      .json({ status: HTTP_STATUS.OK, message: MESSAGES.USER.SIGN_IN.SUCCEED });
  } catch (err) {
    next(err);
  }
});

/* 사용자 정보 조회 API */
router.get('/users', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await prisma.users.findFirst({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        userInfos: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    const userInto = {
      id: user.id,
      email: user.email,
      name: user.userInfos.name,
      role: user.userInfos.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({ status: 200, data: userInto });
  } catch (err) {
    next(err);
  }
});
export default router;
