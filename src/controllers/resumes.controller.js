import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';
import { ResumesService } from '../services/resumes.service.js';
export class ResumesController {
  resumesService = new ResumesService();

  /* 게시물 생성 API */
  createPost = async (req, res, next) => {
    try {
      const user = req.user;
      const { title, introduction } = req.body;

      const createdPost = await this.resumesService.createPost(
        user.id,
        title,
        introduction
      );

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.RESUMES.CREATE.SUCCEED,
        data: createdPost,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 게시글 목록 조회 API */
  findPosts = async (req, res, next) => {
    try {
      const user = req.user;
      const { sort, status } = req.query;

      const data = await this.resumesService.findPosts(user, sort, status);

      //이력서 조회 시 출력될 내용
      const posts = data.map((resume) => ({
        id: resume.id,
        userName: resume.user.name,
        title: resume.title,
        introduction: resume.introduction,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      }));

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
        data: posts,
      });
    } catch (err) {
      next(err);
    }
  };

  /* 게시글 상세 조회 API */
  findPost = async (req, res, next) => {
    try {
      const user = req.user;

      const { id } = req.params;

      const post = await this.resumesService.findPost(id, user);

      const data = {
        id: post.id,
        userName: post.user.name,
        title: post.title,
        introduction: post.introduction,
        status: post.status,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}
