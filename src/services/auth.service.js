import { prisma } from '../utils/prisma.util.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '../constants/env.constant.js';
import {
  HASH_SALT_ROUDNDS,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from '../constants/auth.constant.js';

export class AuthService {
  /* 회원가입 API */
  createAuth = async (email, password, name) => {
    // 유효성 검사 (이메일이 중복된 경우)
    const isExistUser = await prisma.user.findFirst({ where: { email } });

    if (isExistUser) {
      throw {
        status: HTTP_STATUS.CONFLICT,
        message: MESSAGES.USER.COMMON.EMAIL.DUPLICATED,
      };
    }

    // 비밀번호 해시화하기
    const hashedPassword = bcrypt.hashSync(password, HASH_SALT_ROUDNDS);

    // User 테이블에 사용자 추가
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'APPLICANT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  };

  /* 로그인 API */
  signInUser = async (email, password) => {
    // 유효성 검사
    const user = await prisma.user.findUnique({ where: { email } });

    const isPasswordMatched =
      user && bcrypt.compareSync(password, user.password);

    if (!isPasswordMatched) {
      throw {
        status: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.USER.COMMON.UNAUTHORIZED,
      };
    }

    const payload = { id: user.id };

    const tokens = await generateAuthTokens(payload);

    return tokens;
  };

  /* 로그아웃 API */
  signOutUser = async (userId) => {
    await prisma.refreshToken.update({
      where: { userId },
      data: { refreshToken: null },
    });
  };

  /* 토큰 재발급 API */
  refreshToken = async (userId) => {
    const payload = { id: userId };

    const tokens = await generateAuthTokens(payload);

    return tokens;
  };
}

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
