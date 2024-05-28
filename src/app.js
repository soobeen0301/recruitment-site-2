import express from 'express';
import cookieParser from 'cookie-parser';
import { SERVER_PORT } from './constants/env.constant.js';
import UserRouter from './routers/users.router.js';
import ResumeRouter from './routers/resumes.router.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/auth', [UserRouter]);
app.use('/auth', [ResumeRouter]);

app.listen(SERVER_PORT, () => {
  console.log(`Server is listening on ${SERVER_PORT}`);
});
