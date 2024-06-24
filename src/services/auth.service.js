import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MESSAGES } from '../constants/messages.constant.js';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '../constants/env.constant.js';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from '../constants/auth.constant.js';
import { HttpError } from '../errors/http.error.js';
export class AuthService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  /* 회원가입 API */
  signUp = async (email, password, name) => {
    // 유효성 검사 (이메일이 중복된 경우)
    const isExistUser = await this.usersRepository.readOneByEmail(email);

    if (isExistUser) {
      throw new HttpError.Conflict(MESSAGES.USER.COMMON.EMAIL.DUPLICATED);
    }
    const data = await this.usersRepository.create(email, password, name);

    return data;
  };

  /* 로그인 API */
  signIn = async (email, password) => {
    // 유효성 검사
    const user = await this.usersRepository.readOneByEmail(email);

    const isPasswordMatched =
      user && bcrypt.compareSync(password, user.password);

    if (!isPasswordMatched) {
      throw new HttpError.Unauthorized(MESSAGES.USER.COMMON.UNAUTHORIZED);
    }

    const payload = { id: user.id };

    const tokens = await this.generateAuthTokens(payload);

    return tokens;
  };

  /* 로그아웃 API */
  signOut = async (userId) => {
    const data = await this.usersRepository.signOut(userId);

    return data;
  };

  /* 토큰 재발급 API */
  refreshToken = async (userId) => {
    const payload = { id: userId };

    const tokens = await this.generateAuthTokens(payload);

    return tokens;
  };

  generateAuthTokens = async (payload) => {
    const userId = payload.id;

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // RefreshToken 생성
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // RefreshToken 저장
    await this.usersRepository.updateRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  };
}
