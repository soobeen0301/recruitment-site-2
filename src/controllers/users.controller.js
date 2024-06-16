import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
export class UsersController {
  /* 사용자 정보 조회 API */
  readUser = async (req, res, next) => {
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
  };
}
