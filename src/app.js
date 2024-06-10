import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routers/index.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import { SERVER_PORT } from './constants/env.constant.js';
import { HTTP_STATUS } from './constants/http-status.constant.js';
import './utils/prisma.util.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//로드밸런서 체크용 (브라우저 locoalhost:3002/health-check 접속 시 i'm healthy가 출력되게)
app.get('/health-check', (req, res) => {
  throw new Error('예상치 못한 에러');
  return res.status(HTTP_STATUS.OK).send(`I'm healthy`);
});

app.use('/api', apiRouter);

app.use(errorHandler);

app.listen(SERVER_PORT, () => {
  console.log(`Server is listening on ${SERVER_PORT}`);
});
