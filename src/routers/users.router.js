import express from 'express';
import { UsersController } from '../controllers/users.controller.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const router = express.Router();
const usersController = new UsersController();

/* 사용자 정보 조회 API */
router.get('/users', requireAccessToken, usersController.getUser);

export default router;
