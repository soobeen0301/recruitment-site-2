import { prisma } from '../utils/prisma.util.js';
import bcrypt from 'bcrypt';
import { HASH_SALT_ROUDNDS } from '../constants/auth.constant.js';

export class UsersRepository {
  /* 회원가입 API */
  create = async (email, password, name) => {
    const hashedPassword = bcrypt.hashSync(password, HASH_SALT_ROUDNDS);

    const data = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      omit: { password: true },
    });
    return data;
  };

  /* 로그인 API */
  readOneByEmail = async (email) => {
    const data = await prisma.user.findFirst({ where: { email } });

    return data;
  };

  /* 인증 미들웨어 */
  readOneById = async (id) => {
    const data = await prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    return data;
  };
}
