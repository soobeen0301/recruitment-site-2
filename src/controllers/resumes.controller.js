import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
export class ResumesController {
  constructor(resumesService) {
    this.resumesService = resumesService;
  }

  /* 이력서 생성 API */
  create = async (req, res, next) => {
    try {
      const user = req.user;
      const { title, introduction } = req.body;

      const data = await this.resumesService.create(
        user.id,
        title,
        introduction
      );

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.RESUMES.CREATE.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 이력서 목록 조회 API */
  readMany = async (req, res, next) => {
    try {
      const user = req.user;
      const { sort, status } = req.query;

      const data = await this.resumesService.readMany(user, sort, status);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 이력서 상세 조회 API */
  readOne = async (req, res, next) => {
    try {
      const user = req.user;

      const { id } = req.params;

      const data = await this.resumesService.readOne(user, id);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 이력서 수정 API */
  update = async (req, res, next) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const { title, introduction } = req.body;

      const data = await this.resumesService.update(
        user,
        id,
        title,
        introduction
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.UPDATE.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 이력서 삭제 API */
  delete = async (req, res, next) => {
    try {
      const user = req.user;
      const { id } = req.params;

      const data = await this.resumesService.delete(user, id);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.DELETE.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 이력서 지원 상태 변경 API */
  updateStatus = async (req, res, next) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const { status, reason } = req.body;

      const updatedStatus = await this.resumesService.updateStatus(
        user,
        id,
        status,
        reason
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        messages: MESSAGES.RESUMES.UPDATE.STATUS.SUCCEED,
        data: updatedStatus,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 이력서 로그 목록 조회 API */
  readLog = async (req, res, next) => {
    try {
      const { id } = req.params;

      const log = await this.resumesService.readLog(id);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        messages: MESSAGES.RESUMES.READ_LIST.LOG.SUCCEED,
        data: log,
      });
    } catch (err) {
      next(err);
    }
  };
}
