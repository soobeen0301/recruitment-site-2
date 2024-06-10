import express from 'express';
import userRouter from './auth.router.js';
import usersRouter from './users.router.js';
import resumeRouter from './resumes.router.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const apiRouter = express.Router();

apiRouter.use('/auth', [userRouter], [usersRouter]);
apiRouter.use('/auth', requireAccessToken, [resumeRouter]);

export { apiRouter };
