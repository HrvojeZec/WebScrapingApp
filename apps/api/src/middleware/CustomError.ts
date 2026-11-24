import { HttpStatus } from "../constants/httpStauts";

class CustomError extends Error {
  public name: string;
  public statusCode: number;
  public data: unknown;

  constructor({
    message,
    name,
    statusCode,
    data,
  }: {
    message: string;
    name: string;
    statusCode: number;
    data?: unknown;
  }) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, CustomError);
  }
}
class CustomBadRequest extends CustomError {
  constructor(message = "Bad request", data?: unknown) {
    super({
      message,
      name: "HttpBadRequest",
      statusCode: HttpStatus.BAD_REQUEST,
      data,
    });
  }
}

class CustomNotFound extends CustomError {
  constructor(message = "Not Found", data?: unknown) {
    super({
      message,
      name: "HttpNotFound",
      statusCode: HttpStatus.NOT_FOUND,
      data,
    });
  }
}

class CustomInternalServerError extends CustomError {
  constructor(message = "Internal server error", data?: unknown) {
    super({
      message,
      name: "HttpInternalServerError",
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      data,
    });
  }
}

class CustomMultiStatus extends CustomError {
  constructor(message = "Multi-Status", data?: unknown) {
    super({
      message,
      name: "HttpMultiStatus",
      statusCode: HttpStatus.MULTI_STATUS,
      data,
    });
  }
}
export {
  CustomError,
  CustomBadRequest,
  CustomNotFound,
  CustomInternalServerError,
  CustomMultiStatus,
};
