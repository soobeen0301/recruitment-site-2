import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';

class BadRequest {
  constructor(message = MESSAGES.USER.COMMON.BAD_REQUEST) {
    this.message = message;
    this.status = HTTP_STATUS.BAD_REQUEST;
  }
}

class Unauthorized {
  constructor(message = MESSAGES.USER.COMMON.UNAUTHORIZED) {
    this.message = message;
    this.status = HTTP_STATUS.UNAUTHORIZED;
  }
}

class Forbidden {
  constructor(message = MESSAGES.USER.COMMON.FORBIDOEN) {
    this.message = message;
    this.status = HTTP_STATUS.FORBIDDEN;
  }
}

class NotFound {
  constructor(message = MESSAGES.USER.COMMON.NOT_FOUND) {
    this.message = message;
    this.status = HTTP_STATUS.NOT_FOUND;
  }
}

class Conflict {
  constructor(message = MESSAGES.USER.COMMON.EMAIL.DUPLICATED) {
    this.message = message;
    this.status = HTTP_STATUS.CONFLICT;
  }
}

class InternalServerError {
  constructor(message = MESSAGES.USER.COMMON.INTERNAL_SERVER_ERROR) {
    this.message = message;
    this.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
}

export const HttpError = {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  Conflict,
  InternalServerError,
};
