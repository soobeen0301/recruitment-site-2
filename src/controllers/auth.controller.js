import { AuthService } from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { PrismaClient } from '@prisma/client';
import { UsersRepository } from '../repositories/users.repository.js';
export class AuthController {
  constructor() {
    const prisma = new PrismaClient();
    const usersRepository = new UsersRepository(prisma);
    this.authService = new AuthService(usersRepository);
  }

  /* 회원가입 API */
  signUp = async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      const data = await this.authService.signUp(email, password, name);

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.USER.SIGN_UP.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 로그인 API */
  signIn = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const data = await this.authService.signIn(email, password);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.USER.SIGN_IN.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 로그아웃 API */
  signOut = async (req, res, next) => {
    try {
      const user = req.user;

      await this.authService.signOut(user.id);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.USER.SIGN_OUT.SUCCEED,
        data: { id: user.id },
      });
    } catch (err) {
      next(err);
    }
  };

  /* 토큰 재발급 API */
  refreshToken = async (req, res, next) => {
    try {
      const user = req.user;

      const tokens = await this.authService.refreshToken(user.id);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.USER.SIGN_IN.TOKEN.SUCCEED,
        data: tokens,
      });
    } catch (err) {
      next(err);
    }
  };
}
