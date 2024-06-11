import Joi from 'joi';
import { MESSAGES } from '../../constants/messages.constant.js';
import { MIN_RESUME_LENGTH } from '../../constants/resume.constant.js';

const schema = Joi.object({
  title: Joi.string(),
  introduction: Joi.string().min(MIN_RESUME_LENGTH).messages({
    'string.min': MESSAGES.RESUMES.COMMON.INTRODUCTION.MIN_LENGTH,
  }),
})
  .min(1)
  .messages({
    'object.min': MESSAGES.RESUMES.UPDATE.NO_BODY_DATE,
  });

export const updatedResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
