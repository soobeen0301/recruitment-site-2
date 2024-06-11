import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util.js';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '../constants/env.constant.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { signUpValidator } from '../middlewares/validators/sign-up-validator.middleware.js';
import { signInValidator } from '../middlewares/validators/sign-in-validator.middleware.js';
import {
  HASH_SALT_ROUDNDS,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from '../constants/auth.constant.js';
import { requireRefreshToken } from '../middlewares/require-refresh-token.middleware.js';

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

    if (!isPasswordMatched) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.USER.COMMON.UNAUTHORIZED,
      });
    }

    const payload = { id: user.id };

    const data = await generateAuthTokens(payload);

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.USER.SIGN_IN.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/* 토큰 재발급 API */
router.post('/token', requireRefreshToken, async (req, res, next) => {
  try {
    const user = req.user;

    const payload = { id: user.id };

    const data = await generateAuthTokens(payload);

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.USER.SIGN_IN.TOKEN.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

const generateAuthTokens = async (payload) => {
  const userId = payload.id;

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  // RefreshToken 생성
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  // RefreshToken 저장
  const hashedRefreshToken = bcrypt.hashSync(refreshToken, HASH_SALT_ROUDNDS);

  // RefreshToken 생성 또는 갱신
  await prisma.refreshToken.upsert({
    where: {
      userId,
    },
    update: {
      refreshToken: hashedRefreshToken,
    },
    create: {
      userId,
      refreshToken: hashedRefreshToken,
    },
  });

  return { accessToken, refreshToken };
};

export default router;
