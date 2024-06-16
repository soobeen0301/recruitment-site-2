import bcrypt from 'bcrypt';
import { HASH_SALT_ROUDNDS } from '../constants/auth.constant.js';

export class UsersRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  /* 회원가입 API */
  create = async (email, password, name) => {
    const hashedPassword = bcrypt.hashSync(password, HASH_SALT_ROUDNDS);

    const data = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    const { password: omitted, ...result } = data;
    return result;
  };

  /* 로그인 API */
  readOneByEmail = async (email) => {
    const data = await this.prisma.user.findFirst({ where: { email } });

    return data;
  };

  /* 로그아웃 API */
  signOut = async (userId) => {
    const data = await this.prisma.refreshToken.update({
      where: { userId },
      data: { refreshToken: null },
    });
    return data;
  };

  /* refreshTOken 생성 또는 갱신 */
  updateRefreshToken = async (userId, refreshToken) => {
    const hashedRefreshToken = bcrypt.hashSync(refreshToken, HASH_SALT_ROUDNDS);

    await this.prisma.refreshToken.upsert({
      where: {
        userId,
      },
      update: {
        refreshToken: hashedRefreshToken,
      },
      create: {
        userId,
        refreshToken: hashedRefreshToken,
      },
    });
  };

  /* 인증 미들웨어 */
  readOneById = async (id) => {
    const data = await this.prisma.user.findUnique({
      where: { id },
    });
    const { password: omitted, ...result } = data;
    return data;
  };
}
