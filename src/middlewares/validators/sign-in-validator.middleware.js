import Joi from 'joi';
import { MESSAGES } from '../../constants/messages.constant.js';

const schema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': MESSAGES.USER.COMMON.EMAIL.REQUIRED,
    'string.email': MESSAGES.USER.COMMON.EMAIL.INVALID_FORMAT,
  }),
  password: Joi.string().required().messages({
    'any.required': MESSAGES.USER.COMMON.PASSWORD.REQUIRED,
  }),
});

export const signInValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
