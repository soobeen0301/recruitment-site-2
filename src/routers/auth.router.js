import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { signUpValidator } from '../middlewares/validators/sign-up-validator.middleware.js';
import { signInValidator } from '../middlewares/validators/sign-in-validator.middleware.js';
import { requireRefreshToken } from '../middlewares/require-refresh-token.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../services/auth.service.js';
import { UsersRepository } from '../repositories/users.repository.js';

const router = express.Router();

const usersRepository = new UsersRepository(prisma);
const authService = new AuthService(usersRepository);
const authController = new AuthController(authService);

/** 사용자 회원가입 API **/
router.post('/sign-up', signUpValidator, authController.signUp);

/* 사용자 로그인 API */
router.post('/sign-in', signInValidator, authController.signIn);

/* 사용자 로그아웃 API */
router.post('/sign-out', requireRefreshToken, authController.signOut);

/* 토큰 재발급 API */
router.post('/token', requireRefreshToken, authController.refreshToken);

export default router;
