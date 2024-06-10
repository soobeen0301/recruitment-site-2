import Joi from 'joi';
import { MESSAGES } from '../../constants/messages.constant.js';
import { MIN_RESUME_LENGTH } from '../../constants/resume.constant.js';

const schema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': MESSAGES.RESUMES.COMMON.TITLE.REQUIRED,
  }),
  introduction: Joi.string().min(MIN_RESUME_LENGTH).required().messages({
    'any.required': MESSAGES.RESUMES.COMMON.INTRODUCTION.REQUIRED,
    'string.min': MESSAGES.RESUMES.COMMON.INTRODUCTION.MIN_LENGTH,
  }),
});

export const createResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
