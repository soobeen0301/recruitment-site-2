import express from 'express';
import userRouter from './users.router.js';
// import ResumeRouter from './resumes.router.js';

const apiRouter = express.Router();

apiRouter.use('/auth', [userRouter]);
// apiRouter.use('/auth', [ResumeRouter]);

export { apiRouter };
