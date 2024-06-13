import { AuthService } from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
export class AuthController {
  authService = new AuthService();

  /* 회원가입 API */
  createAuth = async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      const createdUser = await this.authService.createAuth(
        email,
        password,
        name
      );

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.USER.SIGN_UP.SUCCEED,
        user: createdUser,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 로그인 API */
  signInUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const tokens = await this.authService.signInUser(email, password);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.USER.SIGN_IN.SUCCEED,
        user: tokens,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 로그아웃 API */
  signOutUser = async (req, res, next) => {
    try {
      const user = req.user;

      await this.authService.signOutUser(user.id);

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
