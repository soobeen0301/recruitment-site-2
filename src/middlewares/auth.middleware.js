import jwt from 'jsonwebtoken';
import { prisma } from '../routers/index.js';
import { JWT_SECRET } from '../constants/env.constant.js';

export default async function (req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new Error('인증 정보가 없습니다.');

    const [tokenType, token] = authorization.split(' ');
    console.log('Received token type:', tokenType);
    console.log('Received token:', token);

    if (tokenType !== 'Bearer')
      throw new Error('지원하지 않는 인증 방식입니다.');

    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decodedToken);
    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
      where: { id: +userId },
    });
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: '인증 정보와 일치하는 사용자가 없습니다.',
      });
    }

    // req.user에 user 정보 저장
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    switch (error.name) {
      case 'TokenExpiredError':
        return res
          .status(401)
          .json({ status: 401, message: '인증 정보가 만료되었습니다.' });
      case 'JsonWebTokenError':
        return res
          .status(401)
          .json({ status: 401, message: '인증 정보가 유효하지 않습니다.' });
      default:
        return res.status(401).json({
          status: 401,
          message: error.message ?? '비정상적인 요청입니다.',
        });
    }
  }
}
