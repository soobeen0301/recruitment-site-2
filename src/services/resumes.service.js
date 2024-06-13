import { prisma } from '../utils/prisma.util.js';
import { USER_ROLE } from '../constants/user.constant.js';
export class ResumesService {
  /* 이력서 생성 API */
  createPost = async (userId, title, introduction) => {
    const post = await prisma.resume.create({
      data: {
        userId,
        title,
        introduction,
      },
    });
    return post;
  };

  /* 게시글 목록 조회 API */
  findPosts = async (user, sort, status) => {
    //정렬
    sort = sort?.toLowerCase();
    if (sort !== 'desc' && sort !== 'asc') {
      sort = 'desc';
    }

    const whereCondition = {};

    // 채용 담당자인 경우
    if (user.role === USER_ROLE.RECRUITER) {
      if (status) {
        whereCondition.status = status;
      }
    }
    // 지원자인 경우
    else {
      whereCondition.userId = +user.id;
    }

    //이력서 목록 조회
    const data = await prisma.resume.findMany({
      where: whereCondition,
      orderBy: { createdAt: sort },
      include: {
        user: true,
      },
    });
    return data;
  };
}
