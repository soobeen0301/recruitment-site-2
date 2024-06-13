import express from 'express';
import { signUpValidator } from '../middlewares/validators/sign-up-validator.middleware.js';
import { signInValidator } from '../middlewares/validators/sign-in-validator.middleware.js';
import { requireRefreshToken } from '../middlewares/require-refresh-token.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';

const router = express.Router();
const authController = new AuthController();

/** 사용자 회원가입 API **/
router.post('/sign-up', signUpValidator, authController.createAuth);

/* 사용자 로그인 API */
router.post('/sign-in', signInValidator, authController.signInUser);

/* 사용자 로그아웃 API */
router.post('/sign-out', requireRefreshToken, authController.signOutUser);

/* 토큰 재발급 API */
router.post('/token', requireRefreshToken, authController.refreshToken);

export default router;
