// Helper code for the API consumer to understand the error and handle is accordingly
const StatusCode = {
  SUCCESS: "10000",
  FAILURE: "10001",
  RETRY: "10002",
  INVALID_ACCESS_TOKEN: "10003",
};

const ResponseStatus = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

class ApiResponse {
  constructor(statusCode, status, message) {
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
  }

  prepare(res, response) {
    return res.status(this.status).json(ApiResponse.sanitize(response));
  }

  send(res) {
    return this.prepare(res, this);
  }

  static sanitize(response) {
    const clone = {};
    Object.assign(clone, response);
    // delete clone.status;
    for (const i in clone) if (typeof clone[i] === "undefined") delete clone[i];
    return clone;
  }
}

class AuthFailureResponse extends ApiResponse {
  constructor(message = "Authentication Failure") {
    super(StatusCode.FAILURE, ResponseStatus.UNAUTHORIZED, message);
  }
}

class NotFoundResponse extends ApiResponse {
  constructor(message = "Not Found") {
    super(StatusCode.FAILURE, ResponseStatus.NOT_FOUND, message);
    this.url;
  }

  send(res) {
    this.url = res.req?.originalUrl;
    return super.prepare(res, this);
  }
}

class ForbiddenResponse extends ApiResponse {
  constructor(message = "Forbidden") {
    super(StatusCode.FAILURE, ResponseStatus.FORBIDDEN, message);
  }
}

class BadRequestResponse extends ApiResponse {
  constructor(message = "Bad Parameters") {
    super(StatusCode.FAILURE, ResponseStatus.BAD_REQUEST, message);
  }
}

class InternalErrorResponse extends ApiResponse {
  constructor(message = "Internal Error") {
    super(StatusCode.FAILURE, ResponseStatus.INTERNAL_ERROR, message);
  }
}

class SuccessMsgResponse extends ApiResponse {
  constructor(message) {
    super(StatusCode.SUCCESS, ResponseStatus.SUCCESS, message);
  }
}

class FailureMsgResponse extends ApiResponse {
  constructor(message) {
    super(StatusCode.FAILURE, ResponseStatus.SUCCESS, message);
  }
}

class SuccessResponse extends ApiResponse {
  constructor(message, data) {
    super(StatusCode.SUCCESS, ResponseStatus.SUCCESS, message);
  }

  send(res) {
    return super.prepare(res, this);
  }
}

class FailureResponse extends ApiResponse {
  constructor(message, data) {
    super(StatusCode.FAILURE, ResponseStatus.BAD_REQUEST, message);
  }

  send(res) {
    return super.prepare(res, this);
  }
}

class AccessTokenErrorResponse extends ApiResponse {
  instruction = "refresh_token";

  constructor(message = "Access token invalid") {
    super(
      StatusCode.INVALID_ACCESS_TOKEN,
      ResponseStatus.UNAUTHORIZED,
      message
    );
  }

  send(res) {
    res.setHeader("instruction", this.instruction);
    return super.prepare(res, this);
  }
}

class TokenRefreshResponse extends ApiResponse {
  constructor(message, accessToken, refreshToken) {
    super(StatusCode.SUCCESS, ResponseStatus.SUCCESS, message);
  }

  send(res) {
    return super.prepare(res, this);
  }
}

module.exports = {
  ApiResponse,
  AuthFailureResponse,
  NotFoundResponse,
  ForbiddenResponse,
  BadRequestResponse,
  InternalErrorResponse,
  SuccessMsgResponse,
  FailureMsgResponse,
  SuccessResponse,
  FailureResponse,
  AccessTokenErrorResponse,
  TokenRefreshResponse,
};
