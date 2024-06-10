import express from 'express';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const router = express.Router();

/* 사용자 정보 조회 API */
router.get('/users', requireAccessToken, async (req, res, next) => {
  try {
    const data = req.user;

    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      messages: MESSAGES.USERS.READ_ME.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});
export default router;
